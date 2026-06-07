import enum

from complexity_engine.analyzers.loop_depth import LoopDepthVisitor
from complexity_engine.analyzers.recursion import RecursionPatternVisitor
from complexity_engine.analyzers.sort_calls import SortCallDetector
from complexity_engine.parsers.python_parser import parse_python


class BigOClass(enum.Enum):
    O1 = "O(1)"
    ON = "O(n)"
    ONlogN = "O(n log n)"
    ON2 = "O(n^2)"
    ON3 = "O(n^3)"
    O2N = "O(2^n)"

    def __str__(self):
        return self.value


def infer_complexity(code: str) -> BigOClass:
    root = parse_python(code)
    loop_visitor = LoopDepthVisitor()
    recursion_visitor = RecursionPatternVisitor()
    sort_detector = SortCallDetector()

    loop_visitor.visit(root)
    recursion_visitor.visit(root)
    sort_detector.visit(root)

    has_recursion = any(count > 0 for count in recursion_visitor.recursive_calls.values())
    branch_count = max(recursion_visitor.recursive_calls.values(), default=0)
    has_memo = bool(set(recursion_visitor.recursive_calls) & recursion_visitor.memoized_functions)

    if loop_visitor.max_depth >= 3:
        return BigOClass.ON3
    if has_recursion and not has_memo and branch_count >= 2:
        return BigOClass.O2N
    if loop_visitor.max_depth == 2:
        return BigOClass.ON2
    if sort_detector.has_sort_outside_loop and loop_visitor.max_depth == 0:
        return BigOClass.ONlogN
    if loop_visitor.max_depth == 1 or (has_recursion and has_memo):
        return BigOClass.ON
    return BigOClass.O1
