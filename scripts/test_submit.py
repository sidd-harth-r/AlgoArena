"""Test the submission flow end-to-end."""
import httpx
import time

API = "http://127.0.0.1:8000"

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

print("Submitting optimal O(n) solution...")
r = httpx.post(f"{API}/submissions/", json={"problem_id": 1, "code": code, "language": "python"}, timeout=10)
print(f"Submit: {r.status_code} {r.text}")
sid = r.json()["submission_id"]

print("Waiting for evaluation...")
for i in range(20):
    time.sleep(2)
    r2 = httpx.get(f"{API}/submissions/{sid}", timeout=10)
    d = r2.json()
    if d["status"] not in ("PENDING", "RUNNING"):
        break
    print(f"  ...{d['status']}")

print(f"\n=== RESULT ===")
print(f"Status:     {d['status']}")
print(f"Passed:     {d['passed_count']}/{d['total_count']}")
print(f"Runtime:    {d.get('runtime_ms')} ms")
print(f"Complexity: {d.get('user_complexity')}")
print(f"Target:     {d.get('optimal_complexity')}")
print(f"Is Optimal: {d.get('is_optimal')}")
if d.get("error_message"):
    print(f"Error:      {d['error_message'][:300]}")
