import ast


class LoopDepthVisitor(ast.NodeVisitor):
    def __init__(self):
        self.depth = 0
        self.max_depth = 0

    def visit_For(self, node: ast.For):
        self._visit_loop(node)

    def visit_While(self, node: ast.While):
        self._visit_loop(node)

    def _visit_loop(self, node: ast.AST):
        self.depth += 1
        self.max_depth = max(self.max_depth, self.depth)
        self.generic_visit(node)
        self.depth -= 1
