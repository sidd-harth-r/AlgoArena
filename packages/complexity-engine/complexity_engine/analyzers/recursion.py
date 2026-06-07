import ast


class RecursionPatternVisitor(ast.NodeVisitor):
    def __init__(self):
        self.current_function: str | None = None
        self.recursive_calls: dict[str, int] = {}
        self.memoized_functions: set[str] = set()

    def visit_FunctionDef(self, node: ast.FunctionDef):
        previous = self.current_function
        self.current_function = node.name
        if any(self._is_memoized(dec) for dec in node.decorator_list):
            self.memoized_functions.add(node.name)
        self.generic_visit(node)
        self.current_function = previous

    def visit_Call(self, node: ast.Call):
        if self.current_function and isinstance(node.func, ast.Name) and node.func.id == self.current_function:
            self.recursive_calls[self.current_function] = self.recursive_calls.get(self.current_function, 0) + 1
        self.generic_visit(node)

    @staticmethod
    def _is_memoized(node: ast.AST) -> bool:
        if isinstance(node, ast.Call):
            return RecursionPatternVisitor._is_memoized(node.func)
        if isinstance(node, ast.Name):
            return node.id in {"lru_cache", "cache", "memoize"}
        if isinstance(node, ast.Attribute):
            return node.attr in {"lru_cache", "cache", "memoize"}
        return False
