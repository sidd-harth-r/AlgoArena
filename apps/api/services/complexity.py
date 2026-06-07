import ast

from models.models import BigOClass


class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.loop_depth = 0
        self.max_loop_depth = 0
        self.sort_outside_loop = False
        self.current_function: str | None = None
        self.recursive_calls: dict[str, int] = {}
        self.memoized_functions: set[str] = set()

    def visit_For(self, node: ast.For):
        self._visit_loop(node)

    def visit_While(self, node: ast.While):
        self._visit_loop(node)

    def _visit_loop(self, node: ast.AST):
        self.loop_depth += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)
        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_FunctionDef(self, node: ast.FunctionDef):
        prior = self.current_function
        self.current_function = node.name
        if any(self._decorator_is_memo(dec) for dec in node.decorator_list):
            self.memoized_functions.add(node.name)
        self.generic_visit(node)
        self.current_function = prior

    def visit_Call(self, node: ast.Call):
        if self.loop_depth == 0 and self._is_sort_call(node):
            self.sort_outside_loop = True
        if self.current_function and isinstance(node.func, ast.Name) and node.func.id == self.current_function:
            self.recursive_calls[self.current_function] = self.recursive_calls.get(self.current_function, 0) + 1
        self.generic_visit(node)

    @staticmethod
    def _decorator_is_memo(node: ast.AST) -> bool:
        name = ""
        if isinstance(node, ast.Name):
            name = node.id
        elif isinstance(node, ast.Attribute):
            name = node.attr
        elif isinstance(node, ast.Call):
            return ComplexityVisitor._decorator_is_memo(node.func)
        return name in {"lru_cache", "cache", "memoize"}

    @staticmethod
    def _is_sort_call(node: ast.Call) -> bool:
        if isinstance(node.func, ast.Name):
            return node.func.id == "sorted"
        if isinstance(node.func, ast.Attribute):
            return node.func.attr == "sort"
        return False


def infer_complexity(code: str) -> BigOClass:
    tree = ast.parse(code)
    visitor = ComplexityVisitor()
    visitor.visit(tree)
    has_recursion = any(count > 0 for count in visitor.recursive_calls.values())
    branch_count = max(visitor.recursive_calls.values(), default=0)
    has_memo = bool(set(visitor.recursive_calls) & visitor.memoized_functions)

    if visitor.max_loop_depth >= 3:
        return BigOClass.ON3
    if has_recursion and not has_memo and branch_count >= 2:
        return BigOClass.O2N
    if visitor.max_loop_depth == 2:
        return BigOClass.ON2
    if visitor.sort_outside_loop and visitor.max_loop_depth == 0:
        return BigOClass.ONlogN
    if visitor.max_loop_depth == 1 or (has_recursion and has_memo):
        return BigOClass.ON
    return BigOClass.O1


def complexity_rank(value: BigOClass | None) -> int:
    order = {BigOClass.O1: 0, BigOClass.OLOGN: 1, BigOClass.ON: 2, BigOClass.OVE: 2, BigOClass.ONlogN: 3, BigOClass.ON2: 4, BigOClass.ON3: 5, BigOClass.O2N: 6}
    return order.get(value, 99)
