import os
import json
import asyncio
import aiohttp
from eventregistry import *
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import time

load_dotenv()

# Configs
news_amount = 2
api_key = os.getenv("EVENTREGISTRY_API_KEY")
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")

# Setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

er = EventRegistry(apiKey=api_key)

class NewsQuery(BaseModel):
    keywords: str
    source: str
    datastart: str
    dateend: str

@app.post("/search-news")
async def search_news(query: NewsQuery):
    start_total = time.time()

    # Query building
    keywords = query.keywords.strip()
    query_params = {
        "keywords": keywords,  # raw phrase search
        "lang": "eng",
        "dateStart": query.datastart,
        "dateEnd": query.dateend
    }
    
    # Skip source filtering for generic terms
    if query.source.strip() and query.source.strip() not in ["news", "blogs", "twitter", "academic"]:
        source_domains = QueryItems.OR([query.source.strip()])
        query_params["sourceUri"] = source_domains
    
    query_obj = QueryArticles(**query_params)
    query_obj.setRequestedResult(RequestArticlesInfo(count=news_amount, sortBy="rel"))

    # Fetch articles
    start_fetch = time.time()
    print("🔍 Fetching articles...")
    results = er.execQuery(query_obj)
    articles = results.get("articles", {}).get("results", [])
    fetch_time = time.time() - start_fetch
    print(f"✅ Found {len(articles)} articles in {fetch_time:.2f}s")

    if not articles:
        return {"error": "No articles found.", "articles": []}

    # Load prompts
    prompts = load_prompts()

    # Process articles with Claude
    start_processing = time.time()
    print("🤖 Processing articles with Claude...")
    processed_results = await process_articles_with_claims(articles, prompts)
    process_time = time.time() - start_processing
    print(f"✅ Claude processing completed in {process_time:.2f}s")

    # Merge results - combine original articles with claim analysis
    final_articles = []
    for i, article in enumerate(articles):
        merged_article = article.copy()  # Start with original article data
        
        # Add claim analysis results
        if i < len(processed_results):
            claim_data = processed_results[i]
            # Remove duplicate uri field and merge claims
            for key, value in claim_data.items():
                if key != "uri":  # Don't overwrite the original URI
                    merged_article[key] = value
        
        final_articles.append(merged_article)

    # Save results
    combined_data = {"articles": final_articles}
    with open("final_combined_output.json", "w") as f:
        json.dump(combined_data, f, indent=4)

    total_time = time.time() - start_total

    print("\n📊 Performance Breakdown:")
    print(f"🕒 Total time: {total_time:.2f} seconds")
    print(f"🔍 Fetch time: {fetch_time:.2f}s")
    print(f"🤖 Claude API processing time: {process_time:.2f}s")
    print(f"🧩 Merging time: {(total_time - fetch_time - process_time):.2f}s")
    
    # Print claim analysis summary
    print_claim_summary(final_articles)

    return combined_data

def load_prompts():
    """Load system prompts from files"""
    def read_file(name):
        try:
            with open(f'prompt/{name}.txt', 'r') as f:
                return f.read()
        except FileNotFoundError:
            print(f"⚠️  Warning: Could not find prompt/{name}.txt")
            return ""
    
    return {
        "broad": read_file("BroadClaim_SystemPrompt"),
        "sub": read_file("SubClaim_SystemPrompt"),
        "think": read_file("ThinkTank_SystemPrompt")
    }

async def process_articles_with_claims(articles, prompts):
    """Process articles in parallel to extract claims"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for article in articles:
            task = process_single_article(session, article, prompts)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"❌ Error processing article {i}: {result}")
                processed_results.append({"uri": articles[i].get("uri", "")})
            else:
                processed_results.append(result)
        
        return processed_results

async def process_single_article(session, article, prompts):
    """Process a single article through all three claim analysis types"""
    uri = article.get("uri", "")
    body = article.get("body", "")
    content_tuple = (uri, body)
    
    # Create user prompts with proper JSON structure requirements
    broad_user_prompt = f"""Please analyze this article and provide results in the specified JSON format:

Content (That is the URI and Description/Content): {content_tuple}

* In your output, provide the identified claim along with the sentence that led to your categorization. 
* For each claim category, provide only ONE sentence that best expresses that claim. If multiple sentences express the same claim, choose the most representative one. 
* Only include claim_sentence fields where claims are actually identified. 
* Following NoSQL format, omit fields where no claims are found. 
* Maintain the exact field names as specified. 
* Use the exact article URI from the input, copying it without any modification into the "uri" field of your output. 
* Only output the article URI and the identified claim_sentence fields. 

Required JSON structure: 
{{ 
"uri": "STRING", 
"bc_gw_not_happening_sentence": "STRING", 
"bc_not_caused_by_human_sentence": "STRING", 
"bc_impacts_not_bad_sentence": "STRING", 
"bc_solutions_wont_work_sentence": "STRING", 
"bc_science_movement_unrel_sentence": "STRING", 
"bc_individual_action_sentence": "STRING"
}}"""

    sub_user_prompt = f"""Please analyze this article and provide results in the specified JSON format:

Content (That is the URI and Description/Content): {content_tuple}

Output Requirements:
* In your output, provide the identified claim along with the sentence that led to your categorization.
* For each claim category, provide only ONE sentence that best expresses that claim. If multiple sentences express the same claim, choose the most representative one.
* Only include claim_sentence fields where claims are actually identified.
* Following NoSQL format, omit fields where no claims are found.
* Maintain the exact field names as specified.
* Use the exact article URI from the input, copying it without any modification into the "uri" field of your output.
* Only output the article URI and the identified claim_sentence fields.

Required JSON structure:
{{
    "uri": "STRING",
    "sc_cold_event_denial_sentence": "STRING",
    "sc_deny_extreme_weather_sentence": "STRING",
    "sc_deny_causal_extreme_weather_sentence": "STRING",
    "sc_natural_variations_sentence": "STRING",
    "sc_past_climate_reference_sentence": "STRING",
    "sc_species_adapt_sentence": "STRING",
    "sc_downplay_warming_sentence": "STRING",
    "sc_policies_negative_sentence": "STRING",
    "sc_policies_ineffective_sentence": "STRING",
    "sc_policies_difficult_sentence": "STRING",
    "sc_low_support_policies_sentence": "STRING",
    "sc_clean_energy_unreliable_sentence": "STRING",
    "sc_climate_science_unrel_sentence": "STRING",
    "sc_no_consensus_sentence": "STRING",
    "sc_movement_unreliable_sentence": "STRING",
    "sc_hoax_conspiracy_sentence": "STRING"
}}"""

    think_user_prompt = f"""Please analyze this article and provide results in the specified JSON format:

Content (That is the URI and Description/Content): {content_tuple}

Output Requirements:
* In your output, provide the identified claim along with the sentence that led to your categorization.
* In your output, provide only ONE sentence showing a supportive think tank reference, even if multiple exist in the article. If multiple sentences show supportive think tank references, choose the most representative one.
* Only include think_tank_ref_sentence field if a supportive think tank reference is actually identified.
* Following NoSQL format, omit the think_tank_ref_sentence field if no supportive think tank reference is found.
* Maintain the exact field names as specified.
* Use the exact article URI from the input, copying it without any modification into the "uri" field of your output.
* Only output the article URI and the think_tank_ref_sentence field.

Required JSON structure:
{{
    "uri": "STRING",
    "think_tank_ref_sentence": "STRING"
}}"""

    # Run all three analyses in parallel
    broad_task = call_claude_api(session, prompts["broad"], broad_user_prompt, "broad")
    sub_task = call_claude_api(session, prompts["sub"], sub_user_prompt, "sub")  
    think_task = call_claude_api(session, prompts["think"], think_user_prompt, "think")
    
    broad_result, sub_result, think_result = await asyncio.gather(
        broad_task, sub_task, think_task, return_exceptions=True
    )
    
    # Merge all results
    merged_result = {"uri": uri}
    
    for result, analysis_type in [(broad_result, "broad"), (sub_result, "sub"), (think_result, "think")]:
        if isinstance(result, Exception):
            print(f"❌ Error in {analysis_type} analysis for {uri}: {result}")
        elif isinstance(result, dict):
            # Merge claims, excluding duplicate uri fields
            for key, value in result.items():
                if key != "uri":
                    merged_result[key] = value
        else:
            print(f"⚠️  Unexpected result type for {analysis_type}: {type(result)}")
    
    return merged_result

async def call_claude_api(session, system_prompt, user_prompt, analysis_type):
    """Make API call to Claude with proper error handling"""
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": "claude-3-7-sonnet-20250219",
        "max_tokens": 4486,
        "temperature": 0.7,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}]
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            async with session.post(url, headers=headers, json=payload, timeout=60) as response:
                if response.status == 200:
                    res = await response.json()
                    content = res.get("content", [])[0].get("text", "")
                    
                    try:
                        # Parse the JSON response
                        parsed_result = json.loads(content)
                        print(f"✅ {analysis_type} analysis completed")
                        return parsed_result
                    except json.JSONDecodeError as e:
                        print(f"⚠️  JSON parsing error for {analysis_type}: {e}")
                        print(f"Raw content: {content[:200]}...")
                        return {"uri": "", "raw_error": f"JSON parse error: {str(e)}"}
                else:
                    print(f"❌ API error {response.status} for {analysis_type}, attempt {attempt + 1}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        
        except Exception as e:
            print(f"❌ Request error for {analysis_type}, attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
    
    # Return empty result on failure
    return {"uri": ""}

def print_claim_summary(articles):
    """Print a summary of claims found across all articles"""
    print("\n🔍 Claim Analysis Summary:")
    print("=" * 50)
    
    total_broad_claims = 0
    total_sub_claims = 0
    total_think_tank_refs = 0
    
    for i, article in enumerate(articles):
        uri = article.get("uri", f"Article_{i}")
        print(f"\n📄 Article {i+1}: {uri[:50]}...")
        
        # Count broad claims
        broad_claims = [key for key in article.keys() if key.startswith("bc_") and key.endswith("_sentence")]
        if broad_claims:
            print(f"   📊 Broad Claims ({len(broad_claims)}): {', '.join([key.replace('bc_', '').replace('_sentence', '') for key in broad_claims])}")
            total_broad_claims += len(broad_claims)
        
        # Count sub claims  
        sub_claims = [key for key in article.keys() if key.startswith("sc_") and key.endswith("_sentence")]
        if sub_claims:
            print(f"   📋 Sub Claims ({len(sub_claims)}): {', '.join([key.replace('sc_', '').replace('_sentence', '') for key in sub_claims])}")
            total_sub_claims += len(sub_claims)
            
        # Check think tank references
        if "think_tank_ref_sentence" in article:
            print(f"   🏛️  Think Tank Reference: ✅")
            total_think_tank_refs += 1
        
        if not broad_claims and not sub_claims and "think_tank_ref_sentence" not in article:
            print("   ❌ No claims found")
    
    print(f"\n📈 Overall Summary:")
    print(f"   📊 Total Broad Claims: {total_broad_claims}")
    print(f"   📋 Total Sub Claims: {total_sub_claims}")  
    print(f"   🏛️  Total Think Tank References: {total_think_tank_refs}")
    print("=" * 50)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)