from .base import NewsCacheBackend
from .in_memory import InMemoryNewsCache

__all__ = ["NewsCacheBackend", "InMemoryNewsCache"]

try:  # optional redis support
    from .redis_cache import RedisNewsCache

    __all__.append("RedisNewsCache")
except RuntimeError:  # redis library missing
    pass
