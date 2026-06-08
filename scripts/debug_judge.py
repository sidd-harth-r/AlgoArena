"""Debug: find which test case fails."""
import sys
sys.path.insert(0, "d:\\4th sem\\DAA\\apps\\api")

from services.judge import _run_locally
from models.database import SessionLocal
from models.models import Problem, TestCase
from sqlalchemy.orm import selectinload
import json

db = SessionLocal()
problem = db.query(Problem).options(selectinload(Problem.test_cases)).filter(Problem.id == 1).first()

code = '''import sys
import json

def solve():
    data = sys.stdin.read().strip().splitlines()
    nums = json.loads(data[0])
    target = int(data[1])
    mp = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in mp:
            print(json.dumps([mp[need], i]))
            return
        mp[num] = i

if __name__ == "__main__":
    solve()
'''

def normalize(s):
    try:
        return json.dumps(json.loads(s), separators=(",",":"), sort_keys=True)
    except:
        return s.strip()

for case in sorted(problem.test_cases, key=lambda tc: tc.display_order):
    r = _run_locally(code, case.input_data, 2000)
    stdout = (r.get("stdout") or "").strip()
    expected = case.expected_out.strip()
    match = normalize(stdout) == normalize(expected)
    if not match:
        print(f"FAIL order={case.display_order}")
        print(f"  input:    {repr(case.input_data)}")
        print(f"  stdout:   {repr(stdout)}")
        print(f"  expected: {repr(expected)}")
        print(f"  norm_out: {repr(normalize(stdout))}")
        print(f"  norm_exp: {repr(normalize(expected))}")
    else:
        print(f"PASS order={case.display_order}")

db.close()
