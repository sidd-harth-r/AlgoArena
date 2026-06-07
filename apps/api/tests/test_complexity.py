from models.models import BigOClass
from services.complexity import infer_complexity


def test_single_loop():
    assert infer_complexity("for i in range(n):\n    pass") == BigOClass.ON


def test_nested_loop():
    assert infer_complexity("for i in r(n):\n    for j in r(n):\n        pass") == BigOClass.ON2


def test_triple_loop():
    assert infer_complexity("for i in r(n):\n    for j in r(n):\n        for k in r(n):\n            pass") == BigOClass.ON3


def test_sorted_no_loop():
    assert infer_complexity("x = sorted(arr)") == BigOClass.ONlogN


def test_branching_recursion():
    assert infer_complexity("def fib(n):\n    return fib(n-1) + fib(n-2)") == BigOClass.O2N


def test_memoized_recursion():
    assert infer_complexity("@lru_cache(None)\ndef fib(n):\n    return fib(n-1) + fib(n-2)") == BigOClass.ON


def test_constant():
    assert infer_complexity("x = a + b") == BigOClass.O1
