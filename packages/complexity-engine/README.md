# complexity-engine

Reusable static complexity inference for Python submissions.

```python
from complexity_engine import infer_complexity

print(infer_complexity("for item in items:\n    print(item)"))
# O(n)
```

The v1 engine focuses on structural signals: loop nesting, top-level sorting, recursive branching, and memoized recursion. It is intentionally static; it does not benchmark runtime.
