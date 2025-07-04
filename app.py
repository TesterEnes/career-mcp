def search_jobs(keywords, location, locale="en_US", affid="213e213hd12344552", user_ip="127.0.0.1", user_agent="Mozilla/5.0", url="http://example.com", **kwargs):
    """
    Search for jobs using Careerjet API.

    Args:
        keywords (str): Keywords to match job titles, content or company names
        location (str): Location of requested jobs
        locale (str): Locale code (default: en_US)
        affid (str): Affiliate ID (required by Careerjet)
        user_ip (str): IP address of the end-user
        user_agent (str): User agent of the end-user's browser
        url (str): URL of page that will display the search results
        **kwargs: Additional search parameters (sort, start_num, pagesize, etc.)

    Returns:
        dict: Search results from Careerjet API
    """
    try:
        # First try the official client
        try:
            from careerjet_api_client import CareerjetAPIClient

            # Initialize Careerjet API client
            cj = CareerjetAPIClient(locale)

            # Prepare search parameters
            search_params = {
                'keywords': keywords,
                'location': location,
                'affid': affid,
                'user_ip': user_ip,
                'user_agent': user_agent,
                'url': url
            }

            # Add optional parameters
            for key, value in kwargs.items():
                if key in ['sort', 'start_num', 'pagesize', 'page', 'contracttype', 'contractperiod']:
                    search_params[key] = value

            # Perform search
            result = cj.search(search_params)
            return result

        except Exception as client_error:
            # Fallback to direct HTTP API call
            return search_jobs_direct_api(keywords, location, locale, affid, user_ip, user_agent, url, **kwargs)

    except Exception as e:
        return {"error": f"Failed to search jobs: {str(e)}"}


def search_jobs_direct_api(keywords, location, locale="en_US", affid="213e213hd12344552", user_ip="127.0.0.1", user_agent="Mozilla/5.0", url="http://example.com", **kwargs):
    """
    Direct HTTP API call to Careerjet as fallback.
    """
    import requests

    # Use the official API endpoint
    api_url = "https://api.careerjet.com/jobs"

    # Prepare parameters for the API
    params = {
        'keywords': keywords,
        'location': location,
        'apikey': affid,  # Use affid as API key
    }

    # Add optional parameters
    for key, value in kwargs.items():
        if key in ['contracttype', 'salary', 'page'] and value is not None:
            params[key] = value

    try:
        # Make API request
        headers = {
            'User-Agent': user_agent,
            'Accept': 'application/json'
        }

        response = requests.get(api_url, params=params, headers=headers, timeout=10)

        if response.status_code == 200:
            try:
                return response.json()
            except ValueError:
                # If JSON parsing fails, return the text response
                return {
                    "error": "Invalid JSON response",
                    "raw_response": response.text[:500]
                }
        elif response.status_code == 401:
            return {
                "error": "Authentication failed - Invalid API key",
                "message": "You need a valid Careerjet API key. Get one from https://www.careerjet.com/partners/api/",
                "status_code": 401
            }
        else:
            return {
                "error": f"API request failed with status {response.status_code}",
                "message": response.text[:200] if response.text else "No response content",
                "url": response.url
            }

    except requests.exceptions.RequestException as e:
        # If API fails, provide a demo response for testing
        return create_demo_response(keywords, location)


def create_demo_response(keywords, location):
    """
    Create a demo response for testing when API is not available.
    """
    return {
        "type": "demo",
        "message": "Bu bir demo yanıttır. Gerçek Careerjet API'si için geçerli bir API key gereklidir.",
        "search_params": {
            "keywords": keywords,
            "location": location
        },
        "jobs": [
            {
                "title": f"{keywords} - Senior Pozisyon",
                "company": "Demo Teknoloji A.Ş.",
                "location": location,
                "salary": "15.000 - 25.000 TL",
                "description": f"{keywords} alanında deneyimli profesyonel aranıyor. {location} lokasyonunda çalışma imkanı.",
                "url": "https://example.com/job1",
                "date": "2025-01-04"
            },
            {
                "title": f"{keywords} - Junior Pozisyon",
                "company": "Yazılım Çözümleri Ltd.",
                "location": location,
                "salary": "8.000 - 15.000 TL",
                "description": f"Yeni mezun {keywords} uzmanı aranıyor. {location} merkezli çalışma.",
                "url": "https://example.com/job2",
                "date": "2025-01-03"
            },
            {
                "title": f"{keywords} - Remote Çalışma",
                "company": "Dijital Ajans",
                "location": f"{location} (Remote)",
                "salary": "12.000 - 20.000 TL",
                "description": f"Uzaktan çalışma imkanı ile {keywords} pozisyonu. Esnek çalışma saatleri.",
                "url": "https://example.com/job3",
                "date": "2025-01-02"
            }
        ],
        "total_jobs": 3,
        "note": "Gerçek iş ilanları için https://www.careerjet.com/partners/api/ adresinden API key alın."
    }


def get_job_details(job_url, locale="en_US"):
    """
    Get detailed information about a specific job.

    Args:
        job_url (str): URL of the job posting
        locale (str): Locale code (default: en_US)

    Returns:
        dict: Job details or error message
    """
    try:
        import requests

        # Simple job details extraction (basic implementation)
        # In a real scenario, you might want to scrape the job page or use additional APIs
        return {
            "job_url": job_url,
            "message": "Job details retrieval would require additional implementation",
            "suggestion": "Use the search_jobs function to get job listings with basic details"
        }

    except Exception as e:
        return {"error": f"Failed to get job details: {str(e)}"}
