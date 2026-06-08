"""Seed all 44 AlgoArena problems with statements, editorials, and ≥10 test cases each.

Usage:
    cd project_root
    python scripts/seed_problems.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_ROOT = ROOT / "apps" / "api"
sys.path.insert(0, str(API_ROOT))

from models.database import Base, SessionLocal, engine
from models.models import BigOClass, Difficulty, Problem, TestCase

# ─── Problem definitions ──────────────────────────────────────────────────── #

PROBLEMS = [
    {
        "slug": "two-sum",
        "title": "Two Sum",
        "topic": "Hash maps",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Two Sum

Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.

You may assume that each input has **exactly one solution**, and you may not use the same element twice. Return the answer as a list sorted in ascending order.

### Input
- Line 1: a JSON array of integers
- Line 2: the target integer

### Output
- A JSON array of two indices (0-indexed, sorted ascending)
""",
        "editorial": """## Editorial: Hash Map Approach
Use a dictionary to store each number's index as you iterate. For each number, check if `target - num` exists in the dictionary. This gives O(n) time, O(n) space.""",
        "cases": [
            ("[2,7,11,15]\n9", "[0,1]", False),
            ("[3,2,4]\n6", "[1,2]", True),
            ("[3,3]\n6", "[0,1]", True),
            ("[1,5,9,2]\n11", "[2,3]", True),
            ("[-1,-2,-3,-4,-5]\n-8", "[2,4]", True),
            ("[0,4,3,0]\n0", "[0,3]", True),
            ("[10,20,30,40]\n70", "[2,3]", True),
            ("[5,75,25]\n100", "[1,2]", True),
            ("[1,2,3,4,5]\n9", "[3,4]", True),
            ("[8,1,2,7]\n9", "[0,1]", True),
        ],
    },
    {
        "slug": "best-time-buy-sell",
        "title": "Best Time to Buy and Sell",
        "topic": "Arrays",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Best Time to Buy and Sell Stock

Given an array `prices` where `prices[i]` is the price of a stock on day `i`, find the maximum profit from one buy-sell transaction. If no profit is possible, return 0.

### Input
- Line 1: a JSON array of integers (prices)

### Output
- A single integer (maximum profit)
""",
        "editorial": """## Editorial
Track the minimum price seen so far. At each day, compute profit = price - min_price and update max_profit. Single pass O(n).""",
        "cases": [
            ("[7,1,5,3,6,4]", "5", False),
            ("[7,6,4,3,1]", "0", False),
            ("[1,2]", "1", True),
            ("[2,1,2,1,0,1,2]", "2", True),
            ("[1]", "0", True),
            ("[3,3,3,3]", "0", True),
            ("[1,4,2,7]", "6", True),
            ("[10,8,2,9]", "7", True),
            ("[5,11,3,50,60,47]", "57", True),
            ("[100,90,80,70,60,50]", "0", True),
        ],
    },
    {
        "slug": "valid-parentheses",
        "title": "Valid Parentheses",
        "topic": "Stacks",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Valid Parentheses

Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. An input string is valid if every open bracket is closed by the same type of bracket in the correct order.

### Input
- Line 1: a string of brackets

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
Use a stack. Push opening brackets, pop on closing brackets and check they match. O(n) time, O(n) space.""",
        "cases": [
            ("()", "True", False),
            ("()[]{}", "True", False),
            ("(]", "False", True),
            ("([)]", "False", True),
            ("{[]}", "True", True),
            ("", "True", True),
            ("(", "False", True),
            ("((()))", "True", True),
            ("[{()}]", "True", True),
            ("))", "False", True),
        ],
    },
    {
        "slug": "merge-sorted-lists",
        "title": "Merge Two Sorted Lists",
        "topic": "Linked lists",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Merge Two Sorted Lists

Given two sorted arrays, merge them into one sorted array.

### Input
- Line 1: a JSON array of integers (sorted)
- Line 2: a JSON array of integers (sorted)

### Output
- A JSON array of integers (merged, sorted)
""",
        "editorial": """## Editorial
Use two pointers, one for each list. Compare current elements, append the smaller one, advance that pointer. O(n+m) time.""",
        "cases": [
            ("[1,2,4]\n[1,3,4]", "[1,1,2,3,4,4]", False),
            ("[]\n[]", "[]", False),
            ("[]\n[0]", "[0]", True),
            ("[1]\n[2]", "[1,2]", True),
            ("[1,3,5]\n[2,4,6]", "[1,2,3,4,5,6]", True),
            ("[1,1,1]\n[2,2,2]", "[1,1,1,2,2,2]", True),
            ("[-3,-1,0]\n[-2,4,5]", "[-3,-2,-1,0,4,5]", True),
            ("[5]\n[1,2,3,4]", "[1,2,3,4,5]", True),
            ("[10,20]\n[15,25]", "[10,15,20,25]", True),
            ("[100]\n[100]", "[100,100]", True),
        ],
    },
    {
        "slug": "maximum-subarray",
        "title": "Maximum Subarray",
        "topic": "Arrays",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Maximum Subarray

Given an integer array `nums`, find the subarray with the largest sum and return its sum.

### Input
- Line 1: a JSON array of integers

### Output
- A single integer (maximum subarray sum)
""",
        "editorial": """## Editorial: Kadane's Algorithm
Track current_sum and max_sum. At each element, current_sum = max(num, current_sum + num). Update max_sum accordingly. O(n).""",
        "cases": [
            ("[-2,1,-3,4,-1,2,1,-5,4]", "6", False),
            ("[1]", "1", False),
            ("[5,4,-1,7,8]", "23", True),
            ("[-1]", "-1", True),
            ("[-2,-1]", "-1", True),
            ("[1,2,3,4]", "10", True),
            ("[-1,2,-1,3,-2]", "4", True),
            ("[0,0,0,0]", "0", True),
            ("[3,-2,5,-1]", "6", True),
            ("[-3,-2,-1,-4]", "-1", True),
        ],
    },
    {
        "slug": "climbing-stairs",
        "title": "Climbing Stairs",
        "topic": "DP",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Climbing Stairs

You are climbing a staircase. It takes `n` steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?

### Input
- Line 1: an integer n (1 ≤ n ≤ 45)

### Output
- A single integer (number of ways)
""",
        "editorial": """## Editorial
This is the Fibonacci sequence. dp[i] = dp[i-1] + dp[i-2]. O(n) time, O(1) space with two variables.""",
        "cases": [
            ("2", "2", False),
            ("3", "3", False),
            ("1", "1", True),
            ("4", "5", True),
            ("5", "8", True),
            ("6", "13", True),
            ("10", "89", True),
            ("15", "987", True),
            ("20", "10946", True),
            ("30", "1346269", True),
        ],
    },
    {
        "slug": "palindrome-number",
        "title": "Palindrome Number",
        "topic": "Math",
        "difficulty": "easy",
        "complexity": BigOClass.OLOGN,
        "statement": """## Palindrome Number

Given an integer `x`, return `True` if `x` is a palindrome, and `False` otherwise. Do this without converting to a string.

### Input
- Line 1: an integer

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
Reverse half of the number and compare. Negative numbers are never palindromes. O(log n) where n is the number.""",
        "cases": [
            ("121", "True", False),
            ("-121", "False", False),
            ("10", "False", True),
            ("0", "True", True),
            ("12321", "True", True),
            ("1234", "False", True),
            ("1001", "True", True),
            ("11", "True", True),
            ("1", "True", True),
            ("-1", "False", True),
        ],
    },
    {
        "slug": "reverse-linked-list",
        "title": "Reverse Linked List",
        "topic": "Linked lists",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Reverse Linked List

Given a list of integers (representing a linked list), reverse the list and return it.

### Input
- Line 1: a JSON array of integers

### Output
- A JSON array of integers (reversed)
""",
        "editorial": """## Editorial
Iterate through the list, reversing pointers. Use three pointers: prev, current, next. O(n) time, O(1) space.""",
        "cases": [
            ("[1,2,3,4,5]", "[5,4,3,2,1]", False),
            ("[1,2]", "[2,1]", False),
            ("[]", "[]", True),
            ("[1]", "[1]", True),
            ("[3,2,1]", "[1,2,3]", True),
            ("[1,1,1]", "[1,1,1]", True),
            ("[10,20,30,40,50]", "[50,40,30,20,10]", True),
            ("[-1,-2,-3]", "[-3,-2,-1]", True),
            ("[0]", "[0]", True),
            ("[5,10]", "[10,5]", True),
        ],
    },
    {
        "slug": "contains-duplicate",
        "title": "Contains Duplicate",
        "topic": "Hash sets",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Contains Duplicate

Given an integer array `nums`, return `True` if any value appears at least twice, and `False` if every element is distinct.

### Input
- Line 1: a JSON array of integers

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
Use a set. For each element, check if it's already in the set. If yes, return True. Otherwise add it. O(n) time, O(n) space.""",
        "cases": [
            ("[1,2,3,1]", "True", False),
            ("[1,2,3,4]", "False", False),
            ("[1,1,1,3,3,4,3,2,4,2]", "True", True),
            ("[]", "False", True),
            ("[1]", "False", True),
            ("[1,2]", "False", True),
            ("[2,2]", "True", True),
            ("[0,0,0]", "True", True),
            ("[-1,1,-1]", "True", True),
            ("[100,200,300,400,500]", "False", True),
        ],
    },
    {
        "slug": "valid-anagram",
        "title": "Valid Anagram",
        "topic": "Hash maps",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Valid Anagram

Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`, and `False` otherwise.

### Input
- Line 1: string s
- Line 2: string t

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
Count character frequencies in both strings and compare. O(n) time, O(1) space (fixed 26-char alphabet).""",
        "cases": [
            ("anagram\nnagaram", "True", False),
            ("rat\ncar", "False", False),
            ("a\na", "True", True),
            ("ab\nba", "True", True),
            ("ab\ncd", "False", True),
            ("listen\nsilent", "True", True),
            ("hello\nworld", "False", True),
            ("aaa\naaa", "True", True),
            ("abc\ncba", "True", True),
            ("abcd\nabce", "False", True),
        ],
    },
    {
        "slug": "3sum",
        "title": "3Sum",
        "topic": "Arrays",
        "difficulty": "medium",
        "complexity": BigOClass.ON2,
        "statement": """## 3Sum

Given an integer array `nums`, return all the unique triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Return each triplet sorted, and the list of triplets sorted lexicographically. No duplicate triplets.

### Input
- Line 1: a JSON array of integers

### Output
- A JSON array of arrays (sorted triplets)
""",
        "editorial": """## Editorial
Sort the array. Fix one element, then use two pointers on the remaining. Skip duplicates. O(n²) time.""",
        "cases": [
            ("[-1,0,1,2,-1,-4]", "[[-1,-1,2],[-1,0,1]]", False),
            ("[0,1,1]", "[]", False),
            ("[0,0,0]", "[[0,0,0]]", True),
            ("[-2,0,1,1,2]", "[[-2,0,2],[-2,1,1]]", True),
            ("[1,2,-2,-1]", "[]", True),
            ("[-1,0,1,0]", "[[-1,0,1]]", True),
            ("[3,-2,1,0]", "[]", True),
            ("[-4,-2,-1,0,1,2,3]", "[[-4,1,3],[-2,-1,3],[-2,0,2],[-1,0,1]]", True),
            ("[0,0,0,0]", "[[0,0,0]]", True),
            ("[-1,-1,0,1,1]", "[[-1,0,1]]", True),
        ],
    },
    {
        "slug": "longest-substring",
        "title": "Longest Substring No Repeat",
        "topic": "Sliding window",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Longest Substring Without Repeating Characters

Given a string `s`, find the length of the longest substring without repeating characters.

### Input
- Line 1: a string

### Output
- A single integer
""",
        "editorial": """## Editorial
Use a sliding window with a set. Expand the right end, shrink the left when a duplicate is found. O(n) time.""",
        "cases": [
            ("abcabcbb", "3", False),
            ("bbbbb", "1", False),
            ("pwwkew", "3", True),
            ("", "0", True),
            ("a", "1", True),
            ("au", "2", True),
            ("dvdf", "3", True),
            ("aab", "2", True),
            ("abcdef", "6", True),
            ("abba", "2", True),
        ],
    },
    {
        "slug": "container-most-water",
        "title": "Container With Most Water",
        "topic": "Two pointers",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Container With Most Water

Given `n` non-negative integers `height` where each represents a vertical line, find two lines that together with the x-axis form a container that holds the most water.

### Input
- Line 1: a JSON array of integers (heights)

### Output
- A single integer (maximum water area)
""",
        "editorial": """## Editorial
Use two pointers from both ends. Move the pointer with the shorter height inward. O(n) time, O(1) space.""",
        "cases": [
            ("[1,8,6,2,5,4,8,3,7]", "49", False),
            ("[1,1]", "1", False),
            ("[4,3,2,1,4]", "16", True),
            ("[1,2,1]", "2", True),
            ("[2,3,4,5,18,17,6]", "17", True),
            ("[1,8,6,2,5,4,8,3,7]", "49", True),
            ("[1,2,3,4,5]", "6", True),
            ("[5,4,3,2,1]", "6", True),
            ("[3,3,3,3]", "9", True),
            ("[10,1,1,1,10]", "40", True),
        ],
    },
    {
        "slug": "group-anagrams",
        "title": "Group Anagrams",
        "topic": "Hash maps",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Group Anagrams

Given an array of strings, group the anagrams together. Return groups sorted alphabetically within each group, and groups sorted by their first element.

### Input
- Line 1: a JSON array of strings

### Output
- A JSON array of arrays of strings (grouped anagrams, sorted)
""",
        "editorial": """## Editorial
Use sorted characters as a hash key. Group strings by their sorted version. O(n * k log k) where k is max string length.""",
        "cases": [
            ('[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]', '[[\"ate\",\"eat\",\"tea\"],[\"bat\"],[\"nat\",\"tan\"]]', False),
            ('[\"a\"]', '[[\"a\"]]', False),
            ('[\"\"]', '[[\"\"]]', True),
            ('[\"ab\",\"ba\",\"cd\",\"dc\"]', '[[\"ab\",\"ba\"],[\"cd\",\"dc\"]]', True),
            ('[\"abc\",\"bca\",\"cab\"]', '[[\"abc\",\"bca\",\"cab\"]]', True),
            ('[\"hello\"]', '[[\"hello\"]]', True),
            ('[\"aa\",\"aa\"]', '[[\"aa\",\"aa\"]]', True),
            ('[\"dog\",\"god\",\"cat\"]', '[[\"cat\"],[\"dog\",\"god\"]]', True),
            ('[\"a\",\"b\",\"c\"]', '[[\"a\"],[\"b\"],[\"c\"]]', True),
            ('[\"listen\",\"silent\",\"enlist\"]', '[[\"enlist\",\"listen\",\"silent\"]]', True),
        ],
    },
    {
        "slug": "top-k-frequent",
        "title": "Top K Frequent Elements",
        "topic": "Hash maps",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Top K Frequent Elements

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. Return them sorted in descending order of frequency, then ascending by value.

### Input
- Line 1: a JSON array of integers
- Line 2: an integer k

### Output
- A JSON array of k integers
""",
        "editorial": """## Editorial
Use a hash map to count frequencies, then bucket sort by frequency. O(n) time with bucket sort approach.""",
        "cases": [
            ("[1,1,1,2,2,3]\n2", "[1,2]", False),
            ("[1]\n1", "[1]", False),
            ("[1,2,3,1,2,1]\n2", "[1,2]", True),
            ("[4,4,4,3,3,2]\n1", "[4]", True),
            ("[5,5,5,5]\n1", "[5]", True),
            ("[1,2]\n2", "[1,2]", True),
            ("[3,3,3,1,1,2,2,2]\n2", "[2,3]", True),
            ("[7,7,8,8,8]\n1", "[8]", True),
            ("[1,1,2,2,3,3]\n3", "[1,2,3]", True),
            ("[10,10,20,20,20]\n1", "[20]", True),
        ],
    },
    {
        "slug": "product-except-self",
        "title": "Product of Array Except Self",
        "topic": "Arrays",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Product of Array Except Self

Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. Do not use division.

### Input
- Line 1: a JSON array of integers

### Output
- A JSON array of integers
""",
        "editorial": """## Editorial
Make two passes: left-to-right prefix products, then right-to-left suffix products. O(n) time, O(1) extra space.""",
        "cases": [
            ("[1,2,3,4]", "[24,12,8,6]", False),
            ("[-1,1,0,-3,3]", "[0,0,9,0,0]", False),
            ("[2,3]", "[3,2]", True),
            ("[1,1,1,1]", "[1,1,1,1]", True),
            ("[5,2,3]", "[6,15,10]", True),
            ("[0,0]", "[0,0]", True),
            ("[1,0,3]", "[0,3,0]", True),
            ("[2,2,2,2]", "[8,8,8,8]", True),
            ("[-1,-1]", "[-1,-1]", True),
            ("[1,2,3,4,5]", "[120,60,40,30,24]", True),
        ],
    },
    {
        "slug": "coin-change",
        "title": "Coin Change",
        "topic": "DP",
        "difficulty": "medium",
        "complexity": BigOClass.ON2,
        "statement": """## Coin Change

Given an array `coins` representing coin denominations and an integer `amount`, return the fewest number of coins needed to make that amount. If it's not possible, return -1.

### Input
- Line 1: a JSON array of integers (coins)
- Line 2: an integer (amount)

### Output
- A single integer
""",
        "editorial": """## Editorial
Use DP. dp[i] = min coins to make amount i. For each coin, dp[i] = min(dp[i], dp[i-coin] + 1). O(amount * coins) time.""",
        "cases": [
            ("[1,5,10]\n11", "2", False),
            ("[2]\n3", "-1", False),
            ("[1]\n0", "0", True),
            ("[1,2,5]\n11", "3", True),
            ("[2]\n1", "-1", True),
            ("[1]\n1", "1", True),
            ("[1]\n2", "2", True),
            ("[1,5,10,25]\n30", "2", True),
            ("[3,7]\n11", "-1", True),
            ("[1,3,5]\n8", "2", True),
        ],
    },
    {
        "slug": "number-of-islands",
        "title": "Number of Islands",
        "topic": "Graphs/BFS",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Number of Islands

Given an m x n 2D grid of '1's (land) and '0's (water), count the number of islands. An island is formed by connecting adjacent lands horizontally or vertically.

### Input
- Line 1: a JSON 2D array of strings ("1" or "0")

### Output
- A single integer (number of islands)
""",
        "editorial": """## Editorial
Use BFS/DFS. For each unvisited '1', start a search and mark all connected '1's as visited. Count the number of searches. O(m*n) time.""",
        "cases": [
            ('[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', "1", False),
            ('[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', "3", False),
            ('[["1"]]', "1", True),
            ('[["0"]]', "0", True),
            ('[["1","0"],["0","1"]]', "2", True),
            ('[["1","1"],["1","1"]]', "1", True),
            ('[["0","0"],["0","0"]]', "0", True),
            ('[["1","0","1"],["0","1","0"],["1","0","1"]]', "5", True),
            ('[["1","1","1"],["0","0","0"],["1","1","1"]]', "2", True),
            ('[["1","0","1","0","1"]]', "3", True),
        ],
    },
    {
        "slug": "binary-search",
        "title": "Binary Search",
        "topic": "Binary search",
        "difficulty": "easy",
        "complexity": BigOClass.OLOGN,
        "statement": """## Binary Search

Given a sorted array of integers `nums` and a `target`, return the index of the target if found, otherwise return -1.

### Input
- Line 1: a JSON array of sorted integers
- Line 2: the target integer

### Output
- A single integer (index or -1)
""",
        "editorial": """## Editorial
Classic binary search. Maintain left and right pointers, check mid. O(log n) time, O(1) space.""",
        "cases": [
            ("[-1,0,3,5,9,12]\n9", "4", False),
            ("[-1,0,3,5,9,12]\n2", "-1", False),
            ("[1]\n1", "0", True),
            ("[1]\n0", "-1", True),
            ("[1,2,3,4,5]\n3", "2", True),
            ("[1,2,3,4,5]\n6", "-1", True),
            ("[2,5]\n5", "1", True),
            ("[1,3,5,7,9,11]\n7", "3", True),
            ("[10,20,30,40,50]\n10", "0", True),
            ("[10,20,30,40,50]\n50", "4", True),
        ],
    },
    {
        "slug": "find-min-rotated",
        "title": "Find Min in Rotated Array",
        "topic": "Binary search",
        "difficulty": "medium",
        "complexity": BigOClass.OLOGN,
        "statement": """## Find Minimum in Rotated Sorted Array

Given a sorted array that has been rotated, find the minimum element.

### Input
- Line 1: a JSON array of integers (rotated sorted, no duplicates)

### Output
- A single integer (minimum element)
""",
        "editorial": """## Editorial
Binary search. If nums[mid] > nums[right], min is in right half. Else it's in left half. O(log n) time.""",
        "cases": [
            ("[3,4,5,1,2]", "1", False),
            ("[4,5,6,7,0,1,2]", "0", False),
            ("[11,13,15,17]", "11", True),
            ("[2,1]", "1", True),
            ("[1]", "1", True),
            ("[3,1,2]", "1", True),
            ("[5,6,7,8,1,2,3,4]", "1", True),
            ("[2,3,4,5,1]", "1", True),
            ("[10,20,30,5]", "5", True),
            ("[7,8,1,2,3,4,5,6]", "1", True),
        ],
    },
    {
        "slug": "search-rotated",
        "title": "Search in Rotated Array",
        "topic": "Binary search",
        "difficulty": "medium",
        "complexity": BigOClass.OLOGN,
        "statement": """## Search in Rotated Sorted Array

Given a rotated sorted array (no duplicates) and a target, return the index of target or -1.

### Input
- Line 1: a JSON array of integers
- Line 2: the target integer

### Output
- A single integer (index or -1)
""",
        "editorial": """## Editorial
Modified binary search. Determine which half is sorted, then check if target lies in that half. O(log n) time.""",
        "cases": [
            ("[4,5,6,7,0,1,2]\n0", "4", False),
            ("[4,5,6,7,0,1,2]\n3", "-1", False),
            ("[1]\n0", "-1", True),
            ("[1]\n1", "0", True),
            ("[3,1]\n1", "1", True),
            ("[5,1,3]\n5", "0", True),
            ("[4,5,6,7,8,1,2,3]\n8", "4", True),
            ("[6,7,1,2,3,4,5]\n4", "5", True),
            ("[2,3,4,5,6,7,1]\n7", "5", True),
            ("[3,5,1]\n3", "0", True),
        ],
    },
    {
        "slug": "level-order-traversal",
        "title": "Binary Tree Level Order",
        "topic": "Trees/BFS",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Binary Tree Level Order Traversal

Given a binary tree as a JSON array (level-order, null for missing nodes), return its level order traversal as a list of lists.

### Input
- Line 1: a JSON array representing a binary tree (null for missing nodes)

### Output
- A JSON array of arrays (values per level)
""",
        "editorial": """## Editorial
Use BFS with a queue. Process one level at a time, recording values. O(n) time, O(n) space.""",
        "cases": [
            ("[3,9,20,null,null,15,7]", "[[3],[9,20],[15,7]]", False),
            ("[1]", "[[1]]", False),
            ("[]", "[]", True),
            ("[1,2,3]", "[[1],[2,3]]", True),
            ("[1,null,2]", "[[1],[2]]", True),
            ("[1,2,null,3]", "[[1],[2],[3]]", True),
            ("[5,4,7,3,null,6,8]", "[[5],[4,7],[3,6,8]]", True),
            ("[1,2,3,4,5,6,7]", "[[1],[2,3],[4,5,6,7]]", True),
            ("[10,5,15]", "[[10],[5,15]]", True),
            ("[1,null,2,null,3]", "[[1],[2],[3]]", True),
        ],
    },
    {
        "slug": "max-depth-tree",
        "title": "Max Depth of Binary Tree",
        "topic": "Trees/DFS",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Maximum Depth of Binary Tree

Given a binary tree as a JSON array, return its maximum depth (number of nodes on the longest path from root to leaf).

### Input
- Line 1: a JSON array representing a binary tree (null for missing)

### Output
- A single integer
""",
        "editorial": """## Editorial
Recursive DFS: depth(node) = 1 + max(depth(left), depth(right)). Base case: null node returns 0. O(n) time.""",
        "cases": [
            ("[3,9,20,null,null,15,7]", "3", False),
            ("[1,null,2]", "2", False),
            ("[]", "0", True),
            ("[1]", "1", True),
            ("[1,2,3,4,5]", "3", True),
            ("[1,2,null,3,null,4]", "4", True),
            ("[1,2,3]", "2", True),
            ("[1,null,2,null,3,null,4]", "4", True),
            ("[5,4,7,3,null,6,8]", "3", True),
            ("[1,2,3,4,5,6,7]", "3", True),
        ],
    },
    {
        "slug": "validate-bst",
        "title": "Validate Binary Search Tree",
        "topic": "Trees",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Validate Binary Search Tree

Given a binary tree as a JSON array, determine if it is a valid BST.

### Input
- Line 1: a JSON array representing a binary tree

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
In-order traversal must produce a strictly increasing sequence. Or use recursive bounds checking. O(n) time.""",
        "cases": [
            ("[2,1,3]", "True", False),
            ("[5,1,4,null,null,3,6]", "False", False),
            ("[1]", "True", True),
            ("[]", "True", True),
            ("[5,3,7,2,4,6,8]", "True", True),
            ("[1,1]", "False", True),
            ("[10,5,15,null,null,6,20]", "False", True),
            ("[3,1,5,0,2,4,6]", "True", True),
            ("[2,2,2]", "False", True),
            ("[10,5,15,3,7,13,18]", "True", True),
        ],
    },
    {
        "slug": "lowest-common-ancestor",
        "title": "Lowest Common Ancestor",
        "topic": "Trees",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Lowest Common Ancestor of a BST

Given a BST as a JSON array and two values p and q, find their lowest common ancestor's value.

### Input
- Line 1: a JSON array representing a BST
- Line 2: two space-separated integers (p and q)

### Output
- A single integer (LCA value)
""",
        "editorial": """## Editorial
In a BST, if both values are less than root, go left. If both greater, go right. Otherwise root is LCA. O(h) time.""",
        "cases": [
            ("[6,2,8,0,4,7,9,null,null,3,5]\n2 8", "6", False),
            ("[6,2,8,0,4,7,9,null,null,3,5]\n2 4", "2", False),
            ("[2,1]\n2 1", "2", True),
            ("[6,2,8]\n2 8", "6", True),
            ("[5,3,7,1,4,6,8]\n1 4", "3", True),
            ("[5,3,7,1,4,6,8]\n6 8", "7", True),
            ("[5,3,7,1,4,6,8]\n1 8", "5", True),
            ("[20,10,30,5,15]\n5 15", "10", True),
            ("[4,2,6,1,3,5,7]\n1 3", "2", True),
            ("[4,2,6,1,3,5,7]\n5 7", "6", True),
        ],
    },
    {
        "slug": "word-search",
        "title": "Word Search",
        "topic": "Graphs/DFS",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Word Search

Given an m x n board of characters and a word, return `True` if the word exists in the grid (using adjacent cells horizontally or vertically, each cell used once).

### Input
- Line 1: a JSON 2D array of characters
- Line 2: a string (the word)

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
Backtracking DFS from each cell. Mark visited cells, try all 4 directions, unmark on backtrack. O(m*n*4^L) worst case.""",
        "cases": [
            ('[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED', "True", False),
            ('[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nSEE', "True", False),
            ('[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCB', "False", True),
            ('[["A"]]\nA', "True", True),
            ('[["A"]]\nB', "False", True),
            ('[["A","B"],["C","D"]]\nABDC', "True", True),
            ('[["A","B"],["C","D"]]\nABCD', "False", True),
            ('[["a","a"]]\naaa', "False", True),
            ('[["C","A","A"],["A","A","A"],["B","C","D"]]\nAAB', "True", True),
            ('[["A","B","C"],["D","E","F"],["G","H","I"]]\nABEF', "False", True),
        ],
    },
    {
        "slug": "course-schedule",
        "title": "Course Schedule",
        "topic": "Graphs/Topo",
        "difficulty": "medium",
        "complexity": BigOClass.OVE,
        "statement": """## Course Schedule

There are `numCourses` courses labeled 0 to numCourses-1. Given a list of prerequisites `[a,b]` meaning you must take b before a, return `True` if you can finish all courses.

### Input
- Line 1: an integer (numCourses)
- Line 2: a JSON array of [course, prerequisite] pairs

### Output
- `True` or `False`
""",
        "editorial": """## Editorial
Topological sort / cycle detection using BFS (Kahn's) or DFS with coloring. O(V+E) time.""",
        "cases": [
            ("2\n[[1,0]]", "True", False),
            ("2\n[[1,0],[0,1]]", "False", False),
            ("1\n[]", "True", True),
            ("3\n[[1,0],[2,1]]", "True", True),
            ("3\n[[0,1],[1,2],[2,0]]", "False", True),
            ("4\n[[1,0],[2,0],[3,1],[3,2]]", "True", True),
            ("5\n[[1,0],[2,1],[3,2],[4,3]]", "True", True),
            ("2\n[]", "True", True),
            ("3\n[[0,1],[0,2],[1,2]]", "True", True),
            ("4\n[[0,1],[1,2],[2,3],[3,1]]", "False", True),
        ],
    },
    {
        "slug": "trapping-rain-water",
        "title": "Trapping Rain Water",
        "topic": "Two pointers",
        "difficulty": "hard",
        "complexity": BigOClass.ON,
        "statement": """## Trapping Rain Water

Given `n` non-negative integers representing an elevation map, compute how much water it can trap after raining.

### Input
- Line 1: a JSON array of non-negative integers

### Output
- A single integer (total water trapped)
""",
        "editorial": """## Editorial
Two pointer approach: maintain left_max and right_max. Move the pointer with smaller max inward. O(n) time, O(1) space.""",
        "cases": [
            ("[0,1,0,2,1,0,1,3,2,1,2,1]", "6", False),
            ("[4,2,0,3,2,5]", "9", False),
            ("[]", "0", True),
            ("[1]", "0", True),
            ("[1,2]", "0", True),
            ("[3,0,3]", "3", True),
            ("[5,2,1,2,1,5]", "14", True),
            ("[0,0,0]", "0", True),
            ("[2,0,2]", "2", True),
            ("[3,1,2,1,3]", "6", True),
        ],
    },
    {
        "slug": "median-two-arrays",
        "title": "Median of Two Sorted Arrays",
        "topic": "Binary search",
        "difficulty": "hard",
        "complexity": BigOClass.OLOGN,
        "statement": """## Median of Two Sorted Arrays

Given two sorted arrays, return the median of the combined sorted array. Return as a float with one decimal place.

### Input
- Line 1: a JSON array of integers (sorted)
- Line 2: a JSON array of integers (sorted)

### Output
- A number (the median, one decimal place)
""",
        "editorial": """## Editorial
Binary search on the partition of the shorter array. O(log(min(m,n))) time.""",
        "cases": [
            ("[1,3]\n[2]", "2.0", False),
            ("[1,2]\n[3,4]", "2.5", False),
            ("[0,0]\n[0,0]", "0.0", True),
            ("[]\n[1]", "1.0", True),
            ("[2]\n[]", "2.0", True),
            ("[1,2,3]\n[4,5,6]", "3.5", True),
            ("[1,3]\n[2,4]", "2.5", True),
            ("[1]\n[2,3,4,5]", "3.0", True),
            ("[100]\n[200]", "150.0", True),
            ("[1,2,3,4,5]\n[6,7,8,9,10]", "5.5", True),
        ],
    },
    {
        "slug": "longest-increasing-subseq",
        "title": "Longest Increasing Subseq.",
        "topic": "DP",
        "difficulty": "medium",
        "complexity": BigOClass.ON2,
        "statement": """## Longest Increasing Subsequence

Given an integer array `nums`, return the length of the longest strictly increasing subsequence.

### Input
- Line 1: a JSON array of integers

### Output
- A single integer
""",
        "editorial": """## Editorial
DP: dp[i] = length of LIS ending at i. For each i, check all j < i. O(n²) time. Can be optimized to O(n log n) with patience sorting.""",
        "cases": [
            ("[10,9,2,5,3,7,101,18]", "4", False),
            ("[0,1,0,3,2,3]", "4", False),
            ("[7,7,7,7,7,7,7]", "1", True),
            ("[1]", "1", True),
            ("[1,2,3,4,5]", "5", True),
            ("[5,4,3,2,1]", "1", True),
            ("[3,1,4,1,5,9,2,6]", "4", True),
            ("[1,3,6,7,9,4,10,5,6]", "6", True),
            ("[2,2]", "1", True),
            ("[10,22,9,33,21,50,41,60]", "5", True),
        ],
    },
    # ─── NEW PROBLEMS (14 additions for v2 roadmap) ─────────────────────── #
    {
        "slug": "implement-trie",
        "title": "Implement Trie",
        "topic": "Tries",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Implement Trie (Prefix Tree)

Implement a trie with `insert`, `search`, and `startsWith` methods.

### Input
- Line 1: JSON array of operations: ["insert", "search", "startsWith"]
- Line 2: JSON array of arguments: [["apple"], ["apple"], ["app"]]

### Output
- A JSON array of results (null for insert, true/false for search/startsWith)
""",
        "editorial": """## Editorial
Use a dictionary-based tree. Each node has children dict and a boolean end marker. Insert walks/creates nodes. Search walks and checks end. StartsWith walks without checking end.""",
        "cases": [
            ('[\"insert\",\"search\",\"search\",\"startsWith\",\"insert\",\"search\"]\n[[\"apple\"],[\"apple\"],[\"app\"],[\"app\"],[\"app\"],[\"app\"]]', '[null,true,false,true,null,true]', False),
            ('[\"insert\",\"search\"]\n[[\"hello\"],[\"hello\"]]', '[null,true]', True),
            ('[\"insert\",\"search\"]\n[[\"hello\"],[\"hell\"]]', '[null,false]', True),
            ('[\"insert\",\"startsWith\"]\n[[\"hello\"],[\"hell\"]]', '[null,true]', True),
            ('[\"insert\",\"insert\",\"search\"]\n[[\"ab\"],[\"abc\"],[\"abc\"]]', '[null,null,true]', True),
            ('[\"insert\",\"search\",\"startsWith\"]\n[[\"a\"],[\"a\"],[\"a\"]]', '[null,true,true]', True),
            ('[\"search\"]\n[[\"empty\"]]', '[false]', True),
            ('[\"insert\",\"insert\",\"search\",\"search\"]\n[[\"bat\"],[\"ball\"],[\"bat\"],[\"ball\"]]', '[null,null,true,true]', True),
            ('[\"insert\",\"startsWith\",\"startsWith\"]\n[[\"abc\"],[\"ab\"],[\"abd\"]]', '[null,true,false]', True),
            ('[\"insert\",\"insert\",\"search\"]\n[[\"abc\"],[\"ab\"],[\"ab\"]]', '[null,null,true]', True),
        ],
    },
    {
        "slug": "kth-largest-element",
        "title": "Kth Largest Element in an Array",
        "topic": "Heap",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Kth Largest Element

Find the kth largest element in an unsorted array.

### Input
- Line 1: a JSON array of integers
- Line 2: an integer k

### Output
- A single integer (the kth largest element)
""",
        "editorial": """## Editorial
Use a min-heap of size k. Iterate through the array, maintaining only the k largest. The top of the heap is the answer. O(n log k) average. QuickSelect gives O(n) average.""",
        "cases": [
            ("[3,2,1,5,6,4]\n2", "5", False),
            ("[3,2,3,1,2,4,5,5,6]\n4", "4", False),
            ("[1]\n1", "1", True),
            ("[7,6,5,4,3,2,1]\n5", "3", True),
            ("[1,2,3,4,5,6,7]\n1", "7", True),
            ("[1,2,3,4,5,6,7]\n7", "1", True),
            ("[99,99,99]\n1", "99", True),
            ("[5,2,4,1,3,6,0]\n4", "3", True),
            ("[-1,-2,-3,-4]\n2", "-2", True),
            ("[2,1]\n2", "1", True),
        ],
    },
    {
        "slug": "find-median-from-stream",
        "title": "Find Median from Data Stream",
        "topic": "Heap",
        "difficulty": "hard",
        "complexity": BigOClass.OLOGN,
        "statement": """## Find Median from Data Stream

Design a data structure that supports adding integers and finding the median.

### Input
- Line 1: JSON array of operations: ["addNum", "findMedian"]
- Line 2: JSON array of arguments: [[1], [], [2], []]

### Output
- A JSON array of results (null for addNum, float for findMedian)
""",
        "editorial": """## Editorial
Use two heaps: a max-heap for the lower half and a min-heap for the upper half. Balance them so sizes differ by at most 1. Median is top of the larger heap, or average of both tops.""",
        "cases": [
            ('[\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"]\n[[1],[2],[],[3],[]]', '[null,null,1.5,null,2.0]', False),
            ('[\"addNum\",\"findMedian\"]\n[[5],[]]', '[null,5.0]', True),
            ('[\"addNum\",\"addNum\",\"findMedian\"]\n[[1],[1],[]]', '[null,null,1.0]', True),
            ('[\"addNum\",\"addNum\",\"addNum\",\"findMedian\"]\n[[1],[2],[3],[]]', '[null,null,null,2.0]', True),
            ('[\"addNum\",\"addNum\",\"addNum\",\"addNum\",\"findMedian\"]\n[[4],[3],[2],[1],[]]', '[null,null,null,null,2.5]', True),
            ('[\"addNum\",\"addNum\",\"addNum\",\"addNum\",\"addNum\",\"findMedian\"]\n[[1],[2],[3],[4],[5],[]]', '[null,null,null,null,null,3.0]', True),
            ('[\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"]\n[[10],[],[20],[]]', '[null,10.0,null,15.0]', True),
            ('[\"addNum\",\"addNum\",\"addNum\",\"findMedian\"]\n[[-1],[-2],[-3],[]]', '[null,null,null,-2.0]', True),
            ('[\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"]\n[[6],[10],[],[2],[],[6],[]]', '[null,null,8.0,null,6.0,null,6.0]', True),
            ('[\"addNum\",\"findMedian\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"]\n[[1],[],[2],[],[3],[]]', '[null,1.0,null,1.5,null,2.0]', True),
        ],
    },
    {
        "slug": "network-delay-time",
        "title": "Network Delay Time",
        "topic": "Graphs",
        "difficulty": "medium",
        "complexity": BigOClass.OELOGV,
        "statement": """## Network Delay Time

Given a network of `n` nodes and weighted directed edges `times[i] = [u, v, w]`, find the time it takes for all nodes to receive a signal sent from node `k`. Return -1 if not all nodes are reachable.

### Input
- Line 1: JSON array of edges [[u,v,w], ...]
- Line 2: n (number of nodes)
- Line 3: k (source node)

### Output
- A single integer (minimum time for all nodes to receive the signal, or -1)
""",
        "editorial": """## Editorial
Classic Dijkstra's algorithm. Build adjacency list, use a min-heap. Track shortest distance to each node. Answer is max of all distances if all reachable, else -1.""",
        "cases": [
            ("[[2,1,1],[2,3,1],[3,4,1]]\n4\n2", "2", False),
            ("[[1,2,1]]\n2\n1", "1", False),
            ("[[1,2,1]]\n2\n2", "-1", True),
            ("[[1,2,1],[2,3,2],[1,3,4]]\n3\n1", "3", True),
            ("[[1,2,1],[2,1,1]]\n2\n1", "1", True),
            ("[[1,2,5],[1,3,2],[3,2,1]]\n3\n1", "3", True),
            ("[[1,2,1],[2,3,1],[3,4,1],[4,5,1]]\n5\n1", "4", True),
            ("[[1,2,1],[1,3,1],[1,4,1]]\n4\n1", "1", True),
            ("[[1,2,10],[1,3,1],[3,2,1]]\n3\n1", "2", True),
            ("[[1,2,1],[2,3,2],[3,1,3]]\n3\n1", "3", True),
        ],
    },
    {
        "slug": "unique-paths",
        "title": "Unique Paths",
        "topic": "Dynamic programming",
        "difficulty": "medium",
        "complexity": BigOClass.OMN,
        "statement": """## Unique Paths

A robot is on an `m x n` grid starting at top-left. It can only move right or down. How many unique paths are there to the bottom-right corner?

### Input
- Line 1: m (rows)
- Line 2: n (columns)

### Output
- A single integer (number of unique paths)
""",
        "editorial": """## Editorial
DP: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base case: first row and first column are all 1. Can optimize to 1D array.""",
        "cases": [
            ("3\n7", "28", False),
            ("3\n2", "3", False),
            ("1\n1", "1", True),
            ("2\n2", "2", True),
            ("7\n3", "28", True),
            ("3\n3", "6", True),
            ("4\n4", "20", True),
            ("5\n5", "70", True),
            ("10\n10", "48620", True),
            ("1\n100", "1", True),
        ],
    },
    {
        "slug": "longest-common-subsequence",
        "title": "Longest Common Subsequence",
        "topic": "Dynamic programming",
        "difficulty": "medium",
        "complexity": BigOClass.OMN,
        "statement": """## Longest Common Subsequence

Given two strings `text1` and `text2`, return the length of their longest common subsequence.

### Input
- Line 1: text1
- Line 2: text2

### Output
- A single integer (length of LCS)
""",
        "editorial": """## Editorial
Classic 2D DP. dp[i][j] = length of LCS of text1[:i] and text2[:j]. If text1[i-1] == text2[j-1], dp[i][j] = dp[i-1][j-1] + 1, else max(dp[i-1][j], dp[i][j-1]).""",
        "cases": [
            ("abcde\nace", "3", False),
            ("abc\nabc", "3", False),
            ("abc\ndef", "0", True),
            ("a\na", "1", True),
            ("a\nb", "0", True),
            ("abcba\nabcbcba", "5", True),
            ("oxcpqrsvwf\nshmtulqrypy", "2", True),
            ("bsbininm\njmjkbkjkv", "1", True),
            ("abcd\nabcd", "4", True),
            ("hofubmnylkra\npqhgxgdofcvmr", "2", True),
        ],
    },
    {
        "slug": "merge-intervals",
        "title": "Merge Intervals",
        "topic": "Intervals",
        "difficulty": "medium",
        "complexity": BigOClass.ONlogN,
        "statement": """## Merge Intervals

Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals.

### Input
- Line 1: a JSON array of intervals [[start, end], ...]

### Output
- A JSON array of merged intervals (sorted by start)
""",
        "editorial": """## Editorial
Sort by start time. Iterate and merge: if current start <= prev end, extend prev end. Otherwise start a new interval. O(n log n) for sort.""",
        "cases": [
            ("[[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]", False),
            ("[[1,4],[4,5]]", "[[1,5]]", False),
            ("[[1,4],[0,4]]", "[[0,4]]", True),
            ("[[1,1]]", "[[1,1]]", True),
            ("[[1,4],[2,3]]", "[[1,4]]", True),
            ("[[1,10],[2,3],[4,5],[6,7]]", "[[1,10]]", True),
            ("[[1,2],[3,4],[5,6]]", "[[1,2],[3,4],[5,6]]", True),
            ("[[1,5],[2,3],[4,8],[9,10]]", "[[1,8],[9,10]]", True),
            ("[[0,0],[1,1]]", "[[0,0],[1,1]]", True),
            ("[[2,3],[4,5],[6,7],[8,9],[1,10]]", "[[1,10]]", True),
        ],
    },
    {
        "slug": "insert-interval",
        "title": "Insert Interval",
        "topic": "Intervals",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Insert Interval

Given a sorted list of non-overlapping intervals and a new interval, insert it and merge if necessary.

### Input
- Line 1: a JSON array of intervals [[start, end], ...]
- Line 2: a JSON array [newStart, newEnd]

### Output
- A JSON array of intervals after insertion
""",
        "editorial": """## Editorial
Three phases: (1) add all intervals before new, (2) merge overlapping ones, (3) add remaining. O(n) single pass.""",
        "cases": [
            ("[[1,3],[6,9]]\n[2,5]", "[[1,5],[6,9]]", False),
            ("[[1,2],[3,5],[6,7],[8,10],[12,16]]\n[4,8]", "[[1,2],[3,10],[12,16]]", False),
            ("[]\n[5,7]", "[[5,7]]", True),
            ("[[1,5]]\n[2,3]", "[[1,5]]", True),
            ("[[1,5]]\n[6,8]", "[[1,5],[6,8]]", True),
            ("[[1,5]]\n[0,0]", "[[0,0],[1,5]]", True),
            ("[[1,2],[5,6]]\n[3,4]", "[[1,2],[3,4],[5,6]]", True),
            ("[[1,5]]\n[0,6]", "[[0,6]]", True),
            ("[[3,5],[12,15]]\n[6,6]", "[[3,5],[6,6],[12,15]]", True),
            ("[[1,2],[3,4],[5,6]]\n[0,7]", "[[0,7]]", True),
        ],
    },
    {
        "slug": "jump-game",
        "title": "Jump Game",
        "topic": "Greedy",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Jump Game

Given an array of non-negative integers where each element represents the maximum jump length from that position, determine if you can reach the last index.

### Input
- Line 1: a JSON array of non-negative integers

### Output
- `true` or `false`
""",
        "editorial": """## Editorial
Greedy: track the farthest reachable index. Iterate left to right. If current index > farthest, return false. Update farthest = max(farthest, i + nums[i]).""",
        "cases": [
            ("[2,3,1,1,4]", "true", False),
            ("[3,2,1,0,4]", "false", False),
            ("[0]", "true", True),
            ("[1]", "true", True),
            ("[1,0]", "true", True),
            ("[0,1]", "false", True),
            ("[5,0,0,0,0]", "true", True),
            ("[1,1,1,1,1]", "true", True),
            ("[1,2,3]", "true", True),
            ("[2,0,0]", "true", True),
        ],
    },
    {
        "slug": "counting-bits",
        "title": "Counting Bits",
        "topic": "Bit manipulation",
        "difficulty": "easy",
        "complexity": BigOClass.ON,
        "statement": """## Counting Bits

Given an integer `n`, return an array of length `n+1` where `ans[i]` is the number of 1's in the binary representation of `i`.

### Input
- Line 1: a non-negative integer n

### Output
- A JSON array of integers
""",
        "editorial": """## Editorial
DP approach: ans[i] = ans[i >> 1] + (i & 1). Each number's bit count = its right-shifted version's count + its last bit. O(n).""",
        "cases": [
            ("2", "[0,1,1]", False),
            ("5", "[0,1,1,2,1,2]", False),
            ("0", "[0]", True),
            ("1", "[0,1]", True),
            ("3", "[0,1,1,2]", True),
            ("7", "[0,1,1,2,1,2,2,3]", True),
            ("10", "[0,1,1,2,1,2,2,3,1,2,2]", True),
            ("4", "[0,1,1,2,1]", True),
            ("8", "[0,1,1,2,1,2,2,3,1]", True),
            ("15", "[0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4]", True),
        ],
    },
    {
        "slug": "rotate-image",
        "title": "Rotate Image",
        "topic": "Math",
        "difficulty": "medium",
        "complexity": BigOClass.ON2,
        "statement": """## Rotate Image

Given an n x n 2D matrix representing an image, rotate it 90 degrees clockwise in-place.

### Input
- Line 1: a JSON 2D array (n x n matrix)

### Output
- The rotated JSON 2D array
""",
        "editorial": """## Editorial
Transpose the matrix (swap rows/cols), then reverse each row. Or do layer-by-layer rotation. Both O(n^2).""",
        "cases": [
            ("[[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]", False),
            ("[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]", False),
            ("[[1]]", "[[1]]", True),
            ("[[1,2],[3,4]]", "[[3,1],[4,2]]", True),
            ("[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]", "[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]", True),
            ("[[0]]", "[[0]]", True),
            ("[[1,0],[0,1]]", "[[0,1],[1,0]]", True),
            ("[[2,29,20,26,16,28],[12,27,9,25,13,21],[32,33,32,2,28,14],[13,14,32,27,22,29],[31,27,33,34,26,21],[18,10,34,29,16,12]]", "[[18,31,13,32,12,2],[10,27,14,33,27,29],[34,33,32,32,9,20],[29,34,27,2,25,26],[16,26,22,28,13,16],[12,21,29,14,21,28]]", True),
            ("[[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]", True),
            ("[[3,1],[4,2]]", "[[4,3],[2,1]]", True),
        ],
    },
    {
        "slug": "maximum-product-subarray",
        "title": "Maximum Product Subarray",
        "topic": "Arrays",
        "difficulty": "medium",
        "complexity": BigOClass.ON,
        "statement": """## Maximum Product Subarray

Given an integer array `nums`, find a contiguous subarray that has the largest product and return the product.

### Input
- Line 1: a JSON array of integers

### Output
- A single integer (maximum product)
""",
        "editorial": """## Editorial
Track both max and min products at each position (since a negative times a negative can become the max). O(n) time, O(1) space.""",
        "cases": [
            ("[2,3,-2,4]", "6", False),
            ("[-2,0,-1]", "0", False),
            ("[0,2]", "2", True),
            ("[-2]", "-2", True),
            ("[2,-5,-2,-4,3]", "24", True),
            ("[-1,-2,-3]", "6", True),
            ("[1,2,3,4]", "24", True),
            ("[-2,3,-4]", "24", True),
            ("[0,0,0]", "0", True),
            ("[2,-1,1,1]", "2", True),
        ],
    },
    {
        "slug": "cheapest-flights-k-stops",
        "title": "Cheapest Flights Within K Stops",
        "topic": "Graphs",
        "difficulty": "medium",
        "complexity": BigOClass.OVE,
        "statement": """## Cheapest Flights Within K Stops

Given `n` cities connected by flights `[from, to, price]`, find the cheapest price from `src` to `dst` with at most `k` stops. Return -1 if no such route.

### Input
- Line 1: n (number of cities)
- Line 2: JSON array of flights [[from, to, price], ...]
- Line 3: src
- Line 4: dst
- Line 5: k (max stops)

### Output
- A single integer (cheapest price, or -1)
""",
        "editorial": """## Editorial
Use Bellman-Ford with k+1 iterations, or BFS with distance tracking. Bellman-Ford: relax all edges k+1 times, keeping a copy of distances from previous round.""",
        "cases": [
            ("4\n[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]\n0\n3\n1", "700", False),
            ("3\n[[0,1,100],[1,2,100],[0,2,500]]\n0\n2\n1", "200", False),
            ("3\n[[0,1,100],[1,2,100],[0,2,500]]\n0\n2\n0", "500", True),
            ("2\n[[0,1,100]]\n0\n1\n0", "100", True),
            ("2\n[[0,1,100]]\n1\n0\n0", "-1", True),
            ("5\n[[0,1,5],[1,2,5],[0,3,2],[3,1,2],[1,4,1],[4,2,1]]\n0\n2\n2", "7", True),
            ("3\n[]\n0\n2\n1", "-1", True),
            ("4\n[[0,1,1],[0,2,5],[1,2,1],[2,3,1]]\n0\n3\n1", "6", True),
            ("3\n[[0,1,2],[1,2,1],[0,2,4]]\n0\n2\n0", "4", True),
            ("3\n[[0,1,1],[1,2,1],[0,2,100]]\n0\n2\n1", "2", True),
        ],
    },
    {
        "slug": "word-search-ii",
        "title": "Word Search II",
        "topic": "Tries",
        "difficulty": "hard",
        "complexity": BigOClass.ON2,
        "statement": """## Word Search II

Given an `m x n` board of characters and a list of words, return all words that can be constructed from letters of sequentially adjacent cells (up/down/left/right). Each cell may only be used once per word.

### Input
- Line 1: a JSON 2D array of characters (the board)
- Line 2: a JSON array of strings (words to find)

### Output
- A sorted JSON array of found words
""",
        "editorial": """## Editorial
Build a Trie from the word list. DFS from each cell, walking the Trie. Prune branches when no Trie children match. Mark found words to avoid duplicates.""",
        "cases": [
            ('[[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]]\n[\"oath\",\"pea\",\"eat\",\"rain\"]', '[\"eat\",\"oath\"]', False),
            ('[[\"a\",\"b\"],[\"c\",\"d\"]]\n[\"abcb\"]', '[]', False),
            ('[[\"a\"]]\n[\"a\"]', '[\"a\"]', True),
            ('[[\"a\",\"b\"],[\"c\",\"d\"]]\n[\"ab\",\"cd\",\"ac\",\"bd\"]', '[\"ab\",\"ac\",\"bd\",\"cd\"]', True),
            ('[[\"a\",\"a\"]]\n[\"aa\"]', '[\"aa\"]', True),
            ('[[\"a\",\"a\"]]\n[\"aaa\"]', '[]', True),
            ('[[\"a\",\"b\",\"c\"],[\"d\",\"e\",\"f\"],[\"g\",\"h\",\"i\"]]\n[\"abc\",\"cfi\",\"beh\",\"defi\"]', '[\"abc\",\"beh\",\"cfi\",\"defi\"]', True),
            ('[[\"x\"]]\n[\"y\"]', '[]', True),
            ('[[\"a\",\"b\"],[\"c\",\"d\"]]\n[\"abdc\",\"acdb\"]', '[\"abdc\",\"acdb\"]', True),
            ('[[\"o\",\"a\",\"b\",\"n\"],[\"o\",\"t\",\"a\",\"e\"],[\"a\",\"h\",\"k\",\"r\"],[\"a\",\"f\",\"l\",\"v\"]]\n[\"oa\",\"oaa\"]', '[\"oa\",\"oaa\"]', True),
        ],
    },
]

# ─── Seeder ────────────────────────────────────────────────────────────────── #


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for index, prob in enumerate(PROBLEMS, start=1):
            slug = prob["slug"]
            problem = db.query(Problem).filter(Problem.slug == slug).first()
            tags = [part.strip() for part in prob["topic"].split("/")]
            if not problem:
                problem = Problem(slug=slug)
                db.add(problem)
            problem.title = prob["title"]
            problem.difficulty = Difficulty(prob["difficulty"])
            problem.topic_tags = tags
            problem.optimal_complexity = prob["complexity"]
            problem.statement_md = prob["statement"]
            problem.editorial_md = prob["editorial"]
            problem.time_limit_ms = 2000
            problem.memory_limit_mb = 256
            problem.is_published = True
            problem.test_cases.clear()
            db.flush()
            for order, (input_data, expected, hidden) in enumerate(prob["cases"]):
                problem.test_cases.append(
                    TestCase(input_data=input_data, expected_out=expected, is_hidden=hidden, display_order=order)
                )
            print(f"  seeded {index:02d}: {slug}")
        db.commit()
        print(f"\n[OK] {len(PROBLEMS)} problems seeded successfully")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
