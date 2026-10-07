export interface LeetcodeProblemItem {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: string;
  keyConcept: string;
}

export interface LeetcodeTopicDomain {
  name: string;
  tag: string;
  icon: string;
  color: string;
  benchmarkTarget: number;
  description: string;
  problems: LeetcodeProblemItem[];
}

export const LEETCODE_DOMAINS: LeetcodeTopicDomain[] = [
  {
    name: 'Arrays & Hashing',
    tag: 'array',
    icon: '📊',
    color: 'from-blue-500 to-cyan-500',
    benchmarkTarget: 25,
    description: 'Fundamental data organization, linear lookups, frequency hashing, and in-place transformations.',
    problems: [
      { id: 1, slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', acceptance: '53.2%', keyConcept: 'Hash Map Lookup' },
      { id: 217, slug: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy', acceptance: '62.1%', keyConcept: 'Hash Set Lookup' },
      { id: 121, slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', acceptance: '54.8%', keyConcept: 'Single Pass Min So Far' },
      { id: 1929, slug: 'concatenation-of-array', title: 'Concatenation of Array', difficulty: 'Easy', acceptance: '89.6%', keyConcept: 'Array Construction' },
      { id: 1480, slug: 'running-sum-of-1d-array', title: 'Running Sum of 1d Array', difficulty: 'Easy', acceptance: '86.4%', keyConcept: 'Prefix Sums' },
      { id: 977, slug: 'squares-of-a-sorted-array', title: 'Squares of a Sorted Array', difficulty: 'Easy', acceptance: '72.5%', keyConcept: 'Two Pointers Transformation' },
      { id: 1295, slug: 'find-numbers-with-even-number-of-digits', title: 'Find Numbers with Even Number of Digits', difficulty: 'Easy', acceptance: '77.8%', keyConcept: 'Array Iteration' },
      { id: 1365, slug: 'how-many-numbers-are-smaller-than-the-current-number', title: 'How Many Numbers Are Smaller Than Current', difficulty: 'Easy', acceptance: '86.7%', keyConcept: 'Frequency Counting' },
    ],
  },
  {
    name: 'Strings & Parsing',
    tag: 'string',
    icon: '🔤',
    color: 'from-cyan-500 to-teal-500',
    benchmarkTarget: 20,
    description: 'String manipulation, palindromes, character frequencies, and pattern parsing.',
    problems: [
      { id: 242, slug: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy', acceptance: '64.5%', keyConcept: 'Character Frequency Array' },
      { id: 125, slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', acceptance: '47.3%', keyConcept: 'Two Pointers Alphanumeric' },
      { id: 14, slug: 'longest-common-prefix', title: 'Longest Common Prefix', difficulty: 'Easy', acceptance: '43.9%', keyConcept: 'Horizontal Scanning' },
      { id: 344, slug: 'reverse-string', title: 'Reverse String', difficulty: 'Easy', acceptance: '78.9%', keyConcept: 'Two Pointers In-Place Swap' },
      { id: 387, slug: 'first-unique-character-in-a-string', title: 'First Unique Character in a String', difficulty: 'Easy', acceptance: '61.4%', keyConcept: 'Character Count Map' },
      { id: 1108, slug: 'defanging-an-ip-address', title: 'Defanging an IP Address', difficulty: 'Easy', acceptance: '89.1%', keyConcept: 'String Replacement' },
      { id: 58, slug: 'length-of-last-word', title: 'Length of Last Word', difficulty: 'Easy', acceptance: '53.0%', keyConcept: 'Reverse Scanning' },
      { id: 205, slug: 'isomorphic-strings', title: 'Isomorphic Strings', difficulty: 'Easy', acceptance: '44.8%', keyConcept: 'Character Bi-Directional Mapping' },
    ],
  },
  {
    name: 'Linked Lists',
    tag: 'linked-list',
    icon: '🔗',
    color: 'from-blue-600 to-indigo-700',
    benchmarkTarget: 15,
    description: 'Pointer traversal, reversals, slow-fast cycle detection, and merge algorithms.',
    problems: [
      { id: 206, slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', acceptance: '76.4%', keyConcept: 'Iterative 3-Pointers' },
      { id: 21, slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', acceptance: '64.7%', keyConcept: 'Dummy Head Node Merging' },
      { id: 141, slug: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy', acceptance: '50.6%', keyConcept: "Floyd's Tortoise & Hare" },
      { id: 83, slug: 'remove-duplicates-from-sorted-list', title: 'Remove Duplicates from Sorted List', difficulty: 'Easy', acceptance: '53.4%', keyConcept: 'Pointer Next Skip' },
      { id: 876, slug: 'middle-of-the-linked-list', title: 'Middle of the Linked List', difficulty: 'Easy', acceptance: '77.9%', keyConcept: 'Fast & Slow Pointer' },
      { id: 234, slug: 'palindrome-linked-list', title: 'Palindrome Linked List', difficulty: 'Easy', acceptance: '52.7%', keyConcept: 'Middle Finding & Reverse' },
      { id: 160, slug: 'intersection-of-two-linked-lists', title: 'Intersection of Two Linked Lists', difficulty: 'Easy', acceptance: '58.3%', keyConcept: 'Dual Pointer Traversal' },
    ],
  },
  {
    name: 'Trees & BST',
    tag: 'tree',
    icon: '🌳',
    color: 'from-emerald-500 to-green-500',
    benchmarkTarget: 20,
    description: 'Hierarchical node traversal (Inorder, Preorder, Postorder, BFS Level-order), and BST invariant search.',
    problems: [
      { id: 226, slug: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy', acceptance: '77.5%', keyConcept: 'Recursive DFS Swapping' },
      { id: 104, slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', acceptance: '75.9%', keyConcept: '1 + Max(Left, Right)' },
      { id: 100, slug: 'same-tree', title: 'Same Tree', difficulty: 'Easy', acceptance: '62.4%', keyConcept: 'Recursive Structural Equality' },
      { id: 101, slug: 'symmetric-tree', title: 'Symmetric Tree', difficulty: 'Easy', acceptance: '57.0%', keyConcept: 'Mirror DFS Comparison' },
      { id: 938, slug: 'range-sum-of-bst', title: 'Range Sum of BST', difficulty: 'Easy', acceptance: '86.8%', keyConcept: 'BST Pruning Traversal' },
      { id: 572, slug: 'subtree-of-another-tree', title: 'Subtree of Another Tree', difficulty: 'Easy', acceptance: '48.1%', keyConcept: 'DFS Tree Matching' },
      { id: 108, slug: 'convert-sorted-array-to-binary-search-tree', title: 'Convert Sorted Array to BST', difficulty: 'Easy', acceptance: '71.5%', keyConcept: 'Divide & Conquer Mid Node' },
      { id: 235, slug: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of BST', difficulty: 'Easy', acceptance: '65.2%', keyConcept: 'BST Value Branching' },
    ],
  },
  {
    name: 'Stacks & Queues',
    tag: 'stack',
    icon: '🥞',
    color: 'from-teal-500 to-emerald-600',
    benchmarkTarget: 15,
    description: 'LIFO & FIFO mechanics, parenthesis validation, monotonic state, and dual stack implementations.',
    problems: [
      { id: 20, slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', acceptance: '41.3%', keyConcept: 'Matching Bracket LIFO Stack' },
      { id: 232, slug: 'implement-queue-using-stacks', title: 'Implement Queue using Stacks', difficulty: 'Easy', acceptance: '66.2%', keyConcept: 'Push/Pop Dual Stack' },
      { id: 155, slug: 'min-stack', title: 'Min Stack', difficulty: 'Easy', acceptance: '54.5%', keyConcept: 'Monotonic Auxiliary Min Tracking' },
      { id: 1047, slug: 'remove-all-adjacent-duplicates-in-string', title: 'Remove Adjacent Duplicates in String', difficulty: 'Easy', acceptance: '70.8%', keyConcept: 'Stack Elimination' },
      { id: 844, slug: 'backspace-string-compare', title: 'Backspace String Compare', difficulty: 'Easy', acceptance: '49.2%', keyConcept: 'Stack Simulation or Two Pointers' },
      { id: 682, slug: 'baseball-game', title: 'Baseball Game', difficulty: 'Easy', acceptance: '76.8%', keyConcept: 'Operations Record Stack' },
      { id: 225, slug: 'implement-stack-using-queues', title: 'Implement Stack using Queues', difficulty: 'Easy', acceptance: '64.1%', keyConcept: 'Queue Rotation' },
    ],
  },
  {
    name: 'Binary Search',
    tag: 'binary-search',
    icon: '🔍',
    color: 'from-rose-500 to-pink-500',
    benchmarkTarget: 15,
    description: 'Logarithmic search space reduction on sorted boundaries, upper/lower bounds, and predicate search.',
    problems: [
      { id: 704, slug: 'binary-search', title: 'Binary Search', difficulty: 'Easy', acceptance: '58.3%', keyConcept: 'Classic Low-High Mid Halving' },
      { id: 35, slug: 'search-insert-position', title: 'Search Insert Position', difficulty: 'Easy', acceptance: '47.2%', keyConcept: 'Lower Bound Insertion Index' },
      { id: 278, slug: 'first-bad-version', title: 'First Bad Version', difficulty: 'Easy', acceptance: '44.7%', keyConcept: 'Boolean Boundary Binary Search' },
      { id: 69, slug: 'sqrtx', title: 'Sqrt(x)', difficulty: 'Easy', acceptance: '39.4%', keyConcept: 'Integer Square Search Space' },
      { id: 374, slug: 'guess-number-higher-or-lower', title: 'Guess Number Higher or Lower', difficulty: 'Easy', acceptance: '54.2%', keyConcept: 'Interactive API Binary Search' },
      { id: 367, slug: 'valid-perfect-square', title: 'Valid Perfect Square', difficulty: 'Easy', acceptance: '44.1%', keyConcept: 'Mid * Mid Boundary Search' },
      { id: 744, slug: 'find-smallest-letter-greater-than-target', title: 'Find Smallest Letter Greater Than Target', difficulty: 'Easy', acceptance: '53.6%', keyConcept: 'Circular Alphabet Bound' },
    ],
  },
  {
    name: 'Dynamic Programming',
    tag: 'dynamic-programming',
    icon: '🧠',
    color: 'from-purple-500 to-indigo-500',
    benchmarkTarget: 20,
    description: 'Optimal substructure, memoization, state transition arrays, and space-optimized Fibonacci sequences.',
    problems: [
      { id: 70, slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', acceptance: '53.1%', keyConcept: '1D State DP / Fibonacci' },
      { id: 509, slug: 'fibonacci-number', title: 'Fibonacci Number', difficulty: 'Easy', acceptance: '71.5%', keyConcept: 'State Transition & Memoization' },
      { id: 746, slug: 'min-cost-climbing-stairs', title: 'Min Cost Climbing Stairs', difficulty: 'Easy', acceptance: '67.0%', keyConcept: 'dp[i] = cost[i] + min(dp[i-1], dp[i-2])' },
      { id: 118, slug: 'pascals-triangle', title: 'Pascal\'s Triangle', difficulty: 'Easy', acceptance: '74.8%', keyConcept: '2D Row Construction' },
      { id: 338, slug: 'counting-bits', title: 'Counting Bits', difficulty: 'Easy', acceptance: '78.5%', keyConcept: 'Bitwise DP (dp[i] = dp[i >> 1] + (i & 1))' },
      { id: 1025, slug: 'divisor-game', title: 'Divisor Game', difficulty: 'Easy', acceptance: '71.0%', keyConcept: 'Game Theory Parity DP' },
      { id: 392, slug: 'is-subsequence', title: 'Is Subsequence', difficulty: 'Easy', acceptance: '48.2%', keyConcept: 'Greedy Two-Pointer Substructure' },
    ],
  },
  {
    name: 'Graphs & BFS/DFS',
    tag: 'graph',
    icon: '🕸️',
    color: 'from-amber-500 to-orange-500',
    benchmarkTarget: 15,
    description: 'Adjacency list traversal, connected components, flood fill, visited sets, and shortest path queues.',
    problems: [
      { id: 1791, slug: 'find-center-of-star-graph', title: 'Find Center of Star Graph', difficulty: 'Easy', acceptance: '85.2%', keyConcept: 'Node Degree Comparison' },
      { id: 997, slug: 'find-the-town-judge', title: 'Find the Town Judge', difficulty: 'Easy', acceptance: '50.1%', keyConcept: 'In-Degree vs Out-Degree Count' },
      { id: 463, slug: 'island-perimeter', title: 'Island Perimeter', difficulty: 'Easy', acceptance: '72.3%', keyConcept: 'Grid Boundary Neighbors' },
      { id: 733, slug: 'flood-fill', title: 'Flood Fill', difficulty: 'Easy', acceptance: '64.8%', keyConcept: '4-Directional DFS/BFS Coloring' },
      { id: 1971, slug: 'find-if-path-exists-in-graph', title: 'Find if Path Exists in Graph', difficulty: 'Easy', acceptance: '54.5%', keyConcept: 'Disjoint Set Union or BFS' },
      { id: 695, slug: 'max-area-of-island', title: 'Max Area of Island', difficulty: 'Easy', acceptance: '72.0%', keyConcept: 'Recursive DFS Area Counting' },
    ],
  },
  {
    name: 'Sliding Window & Two Pointers',
    tag: 'sliding-window',
    icon: '🪟',
    color: 'from-violet-500 to-purple-600',
    benchmarkTarget: 15,
    description: 'Subarray window expansion and contraction, two-pointer inward sweeps, and contiguous constraint tracking.',
    problems: [
      { id: 1984, slug: 'minimum-difference-between-highest-and-lowest-of-k-scores', title: 'Min Difference of K Scores', difficulty: 'Easy', acceptance: '60.1%', keyConcept: 'Sort + Fixed Window of K' },
      { id: 283, slug: 'move-zeroes', title: 'Move Zeroes', difficulty: 'Easy', acceptance: '62.0%', keyConcept: 'Slow-Fast Non-Zero In-Place Swap' },
      { id: 26, slug: 'remove-duplicates-from-sorted-array', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', acceptance: '57.6%', keyConcept: 'Slow Pointer Unique Tracking' },
      { id: 27, slug: 'remove-element', title: 'Remove Element', difficulty: 'Easy', acceptance: '58.7%', keyConcept: 'Filter & Overwrite In-Place' },
      { id: 1876, slug: 'substrings-of-size-three-with-distinct-characters', title: 'Substrings of Size Three Distinct', difficulty: 'Easy', acceptance: '73.4%', keyConcept: 'Fixed Window Size 3 Set' },
      { id: 643, slug: 'maximum-average-subarray-i', title: 'Maximum Average Subarray I', difficulty: 'Easy', acceptance: '44.3%', keyConcept: 'Fixed Size K Sliding Window Sum' },
    ],
  },
  {
    name: 'Heap & Priority Queue',
    tag: 'heap-priority-queue',
    icon: '🏔️',
    color: 'from-indigo-500 to-blue-600',
    benchmarkTarget: 10,
    description: 'Min-heaps, max-heaps, dynamic top-K tracking, and greedy simulation.',
    problems: [
      { id: 1046, slug: 'last-stone-weight', title: 'Last Stone Weight', difficulty: 'Easy', acceptance: '66.1%', keyConcept: 'Max-Heap Smash Simulation' },
      { id: 703, slug: 'kth-largest-element-in-a-stream', title: 'Kth Largest Element in a Stream', difficulty: 'Easy', acceptance: '58.8%', keyConcept: 'Min-Heap of Size K' },
      { id: 506, slug: 'relative-ranks', title: 'Relative Ranks', difficulty: 'Easy', acceptance: '72.4%', keyConcept: 'Max-Heap or Sort with Indices' },
      { id: 2558, slug: 'take-gifts-from-the-richest-pile', title: 'Take Gifts From Richest Pile', difficulty: 'Easy', acceptance: '71.5%', keyConcept: 'Max-Heap Square Root Extraction' },
      { id: 1464, slug: 'maximum-product-of-two-elements-in-an-array', title: 'Max Product of Two Elements', difficulty: 'Easy', acceptance: '83.2%', keyConcept: 'Track Top 2 Largest' },
    ],
  },
];

/**
 * Filter problems for a specific topic, strictly excluding any problem the student
 * has already solved (matched via titleSlug/slug in solvedSlugs).
 */
export function getUnsolvedEasyProblems(
  domainTag: string,
  solvedSlugs: string[] = [],
  count: number = 3
): { domain: LeetcodeTopicDomain; recommended: LeetcodeProblemItem[]; totalSolvedInDomain: number } | null {
  const domain = LEETCODE_DOMAINS.find((d) => d.tag === domainTag || d.name.toLowerCase() === domainTag.toLowerCase());
  if (!domain) return null;

  const solvedSet = new Set(solvedSlugs.map((s) => s.toLowerCase().trim()));

  // Count how many from this curated domain list the student has solved
  const solvedCount = domain.problems.filter((p) => solvedSet.has(p.slug.toLowerCase())).length;

  // Filter for unsolved problems
  const unsolved = domain.problems.filter((p) => !solvedSet.has(p.slug.toLowerCase()));

  // Pick top 'count' easy problems
  const recommended = unsolved.slice(0, count);

  return {
    domain,
    recommended,
    totalSolvedInDomain: solvedCount,
  };
}
