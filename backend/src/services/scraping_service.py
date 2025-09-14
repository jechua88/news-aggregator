import requests
from bs4 import BeautifulSoup
from typing import List, Optional
from datetime import datetime
from ..models.news_headline import NewsHeadline
from ..models.news_source import NewsSource
import logging

logger = logging.getLogger(__name__)


class ScrapingService:
    """Service for web scraping when RSS fails"""

    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    def scrape_headlines(self, source: NewsSource) -> List[NewsHeadline]:
        """Scrape headlines from fallback URL"""
        try:
            logger.info(f"Scraping headlines for {source.name}: {source.fallback_url}")
            
            # Fetch webpage
            response = requests.get(
                source.fallback_url,
                timeout=self.timeout,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            )
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract headlines based on source-specific selectors
            headlines = self._extract_headlines(soup, source)
            
            # Limit to max_stories
            headlines = headlines[:source.max_stories]
            
            logger.info(f"Successfully scraped {len(headlines)} headlines from {source.name}")
            return headlines
            
        except requests.Timeout:
            logger.error(f"Timeout scraping {source.name}")
            raise Exception(f"Timeout scraping {source.name}")
        except requests.RequestException as e:
            logger.error(f"Error scraping {source.name}: {e}")
            raise Exception(f"Error scraping {source.name}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error scraping {source.name}: {e}")
            raise Exception(f"Unexpected error scraping {source.name}: {e}")

    def _extract_headlines(self, soup: BeautifulSoup, source: NewsSource) -> List[NewsHeadline]:
        """Extract headlines using source-specific logic"""
        headlines = []
        
        # Define selectors for different sources
        selectors = self._get_selectors_for_source(source.name)
        
        for selector in selectors:
            try:
                elements = soup.select(selector)
                
                for element in elements[:source.max_stories]:
                    try:
                        headline = self._parse_headline_element(element, source)
                        if headline:
                            headlines.append(headline)
                    except Exception as e:
                        logger.warning(f"Error parsing headline element for {source.name}: {e}")
                        continue
                        
                if headlines:
                    break
                    
            except Exception as e:
                logger.warning(f"Error using selector '{selector}' for {source.name}: {e}")
                continue
        
        return headlines

    def _get_selectors_for_source(self, source_name: str) -> List[str]:
        """Get CSS selectors for a specific source"""
        # Generic selectors that might work for many news sites
        generic_selectors = [
            'h1 a', 'h2 a', 'h3 a',
            '.headline a', '.title a',
            'article a', '.story-headline a',
            '.news-title a', '.article-title a'
        ]
        
        # Source-specific selectors (can be expanded)
        source_selectors = {
            'Wall Street Journal': ['.WSJTheme--headline--7xZ5j39U a'],
            'Bloomberg': ['.headline__text'],
            'CNBC': ['.Card-title'],
            'DealStreetAsia': ['h3 a'],
        }
        
        # Return source-specific selectors if available, otherwise generic
        return source_selectors.get(source_name, generic_selectors)

    def _parse_headline_element(self, element, source: NewsSource) -> Optional[NewsHeadline]:
        """Parse a single headline element"""
        try:
            # Extract text
            title = element.get_text().strip()
            if not title or len(title) < 10:
                return None
            
            # Extract link
            link = element.get('href', '')
            if not link:
                return None
                
            # Handle relative URLs
            if link.startswith('/'):
                # Convert to absolute URL
                base_url = source.fallback_url.rstrip('/')
                link = base_url + link
            
            # Create headline
            headline = NewsHeadline(
                title=title,
                link=link,
                published_at=datetime.now(),  # Scraping doesn't always provide exact dates
                source=source.name
            )
            
            return headline
            
        except Exception as e:
            logger.warning(f"Error parsing headline element: {e}")
            return None