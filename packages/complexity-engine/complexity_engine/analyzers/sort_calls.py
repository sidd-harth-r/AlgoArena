import ast


class SortCallDetector(ast.NodeVisitor):
    def __init__(self):
        self.loop_depth = 0
        self.has_sort_outside_loop = False

    def visit_For(self, node: ast.For):
        self._visit_loop(node)

    def visit_While(self, node: ast.While):
        self._visit_loop(node)

    def _visit_loop(self, node: ast.AST):
        self.loop_depth += 1
        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_Call(self, node: ast.Call):
        if self.loop_depth == 0 and self._is_sort(node):
            self.has_sort_outside_loop = True
        self.generic_visit(node)

    @staticmethod
    def _is_sort(node: ast.Call) -> bool:
        if isinstance(node.func, ast.Name):
            return node.func.id == "sorted"
        if isinstance(node.func, ast.Attribute):
            return node.func.attr == "sort"
        return False
