import ast


def parse_python(code: str) -> ast.Module:
    return ast.parse(code)
