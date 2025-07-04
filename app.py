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

    except ImportError:
        return {"error": "careerjet-api-client not installed. Please install it using: pip install careerjet-api-client"}
    except Exception as e:
        return {"error": f"Failed to search jobs: {str(e)}"}


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
