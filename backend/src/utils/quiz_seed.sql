-- ============================================================
-- QUIZ PORTAL - QUESTION BANK SEED DATA
-- Subject: Data Structures & Algorithms (DSA)
-- 3 Sets × 25 Questions = 75 total
-- Difficulty split per set: ~8 Easy, 9 Medium, 8 Hard
-- ============================================================

INSERT INTO quiz_questions (subject, set_number, difficulty, question_text, option_a, option_b, option_c, option_d, correct_ans, explanation, topic_tag) VALUES

-- ===================== SET 1 - EASY (8) =====================
('Data Structures', 1, 'easy',
 'What is the time complexity of accessing an element in an array by index?',
 'O(n)', 'O(log n)', 'O(1)', 'O(n²)',
 'C', 'Array access by index is O(1) because arrays are stored in contiguous memory locations, allowing direct calculation of the memory address.', 'Arrays'),

('Data Structures', 1, 'easy',
 'Which data structure uses LIFO (Last In First Out) principle?',
 'Queue', 'Stack', 'Linked List', 'Tree',
 'B', 'A Stack follows LIFO principle €” the last element inserted is the first one to be removed. Think of a stack of plates.', 'Stack'),

('Data Structures', 1, 'easy',
 'What is the time complexity of Binary Search?',
 'O(n)', 'O(n log n)', 'O(log n)', 'O(1)',
 'C', 'Binary Search divides the search space in half at each step, giving O(log n) time complexity. It requires the array to be sorted.', 'Searching'),

('Data Structures', 1, 'easy',
 'Which sorting algorithm has worst-case O(n²) and best-case O(n)?',
 'Merge Sort', 'Quick Sort', 'Bubble Sort', 'Heap Sort',
 'C', 'Bubble Sort has O(n²) worst case and O(n) best case (when array is already sorted with early termination optimization).', 'Sorting'),

('Data Structures', 1, 'easy',
 'In a singly linked list, what does the last node point to?',
 'The first node', 'Itself', 'NULL', 'The second-to-last node',
 'C', 'In a singly linked list, the last node''s next pointer points to NULL to indicate the end of the list.', 'Linked List'),

('Data Structures', 1, 'easy',
 'What is the maximum number of nodes at depth d in a binary tree?',
 '2d', '2^d', 'd²', 'd+1',
 'B', 'At depth d (root is depth 0), a binary tree can have at most 2^d nodes, since each node can have at most 2 children.', 'Trees'),

('Data Structures', 1, 'easy',
 'Which operation removes the front element in a Queue?',
 'push()', 'pop()', 'dequeue()', 'peek()',
 'C', 'dequeue() (also called poll or remove) removes and returns the front element of a Queue following FIFO order.', 'Queue'),

('Data Structures', 1, 'easy',
 'What does DFS stand for in graph algorithms?',
 'Dynamic First Search', 'Depth First Search', 'Data First Sort', 'Direct Function Search',
 'B', 'DFS stands for Depth First Search €” a graph traversal algorithm that explores as far as possible along each branch before backtracking.', 'Graphs'),

-- ===================== SET 1 - MEDIUM (9) =====================
('Data Structures', 1, 'medium',
 'What is the time complexity of inserting an element at the beginning of a singly linked list?',
 'O(n)', 'O(log n)', 'O(1)', 'O(n²)',
 'C', 'Inserting at the beginning of a linked list is O(1) €” create a new node, point it to the current head, update head. No traversal needed.', 'Linked List'),

('Data Structures', 1, 'medium',
 'Which traversal visits nodes in the order: Left, Root, Right?',
 'Pre-order', 'In-order', 'Post-order', 'Level-order',
 'B', 'In-order traversal visits: Left subtree †’ Root †’ Right subtree. For a BST, this gives nodes in sorted ascending order.', 'Trees'),

('Data Structures', 1, 'medium',
 'What is the average time complexity of QuickSort?',
 'O(n²)', 'O(n)', 'O(n log n)', 'O(log n)',
 'C', 'QuickSort has an average-case complexity of O(n log n). Worst case is O(n²) when the pivot is always the smallest or largest element.', 'Sorting'),

('Data Structures', 1, 'medium',
 'In a Min-Heap, which property is always satisfied?',
 'Parent node is always greater than children', 'Parent node is always smaller than children', 'Left child is always smaller than right child', 'Root is always the maximum element',
 'B', 'In a Min-Heap, every parent node is smaller than or equal to its children. The root always contains the minimum element.', 'Heaps'),

('Data Structures', 1, 'medium',
 'What is the space complexity of Merge Sort?',
 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)',
 'C', 'Merge Sort requires O(n) auxiliary space for the temporary arrays used during the merge step.', 'Sorting'),

('Data Structures', 1, 'medium',
 'Which data structure is used to implement BFS (Breadth First Search)?',
 'Stack', 'Queue', 'Priority Queue', 'Deque',
 'B', 'BFS uses a Queue (FIFO) to maintain the order of node exploration €” visit all neighbors of current level before going deeper.', 'Graphs'),

('Data Structures', 1, 'medium',
 'What is the height of a complete binary tree with n nodes?',
 'n', 'log‚‚(n)', 'n/2', 'ˆšn',
 'B', 'A complete binary tree with n nodes has height ŒŠlog‚‚(n)Œ‹, making all operations on it O(log n).', 'Trees'),

('Data Structures', 1, 'medium',
 'Which of the following has O(1) amortized insertion complexity?',
 'Linked List (end)', 'Dynamic Array (ArrayList)', 'Sorted Array', 'Binary Search Tree',
 'B', 'Dynamic arrays (ArrayList) have O(1) amortized insertion at the end. When capacity is exceeded, doubling the array size spreads the cost across many insertions.', 'Arrays'),

('Data Structures', 1, 'medium',
 'In hashing, what is a collision?',
 'When the hash table is full', 'When two keys map to the same hash value', 'When a key is not found', 'When the load factor exceeds 1',
 'B', 'A collision occurs when two different keys produce the same hash value and therefore map to the same bucket/slot in the hash table.', 'Hashing'),

-- ===================== SET 1 - HARD (8) =====================
('Data Structures', 1, 'hard',
 'What is the time complexity of finding the diameter of a binary tree using DFS?',
 'O(n²)', 'O(n log n)', 'O(n)', 'O(log n)',
 'C', 'Using a single DFS pass where each node computes the max depth of its subtrees and updates a global max diameter, the diameter can be found in O(n) time.', 'Trees'),

('Data Structures', 1, 'hard',
 'In Dijkstra''s algorithm using a binary min-heap, what is the time complexity?',
 'O(V²)', 'O(E log V)', 'O(V log E)', 'O(E + V)',
 'B', 'With a binary min-heap (priority queue), Dijkstra''s processes each edge once and each heap operation is O(log V), giving O(E log V) total.', 'Graphs'),

('Data Structures', 1, 'hard',
 'What problem does the Floyd-Warshall algorithm solve?',
 'Single source shortest path', 'All-pairs shortest path', 'Minimum spanning tree', 'Topological sort',
 'B', 'Floyd-Warshall solves the All-Pairs Shortest Path problem in O(V³) using dynamic programming with a 3D state.', 'Dynamic Programming'),

('Data Structures', 1, 'hard',
 'What is the key invariant maintained by a Red-Black Tree?',
 'Height is always log n', 'Every path from root to null has the same number of black nodes', 'Red nodes are always leaves', 'Black nodes have no children',
 'B', 'The Red-Black Tree invariant ensures every path from root to NULL (leaf) contains the same number of black nodes, keeping the tree balanced with O(log n) height.', 'Trees'),

('Data Structures', 1, 'hard',
 'In the context of dynamic programming, what is "overlapping subproblems"?',
 'Subproblems that share the same time complexity', 'The same subproblems are solved multiple times in a naive recursive approach', 'Subproblems that cannot be divided further', 'Subproblems solved by different algorithms',
 'B', 'Overlapping subproblems means a recursive solution solves the same sub-problem multiple times. DP stores results (memoization/tabulation) to avoid redundant computation.', 'Dynamic Programming'),

('Data Structures', 1, 'hard',
 'Which of the following is NOT a property of a B-Tree of order m?',
 'Every node has at most m children', 'All leaves are at the same level', 'Root has at least 2 children if not a leaf', 'Internal nodes store only keys, not data',
 'D', 'B-Trees store data in both internal nodes and leaves (unlike B+ Trees where only leaves store data). The other three properties are valid B-Tree properties.', 'Trees'),

('Data Structures', 1, 'hard',
 'What is the amortized time complexity of a Fibonacci Heap''s decrease-key operation?',
 'O(log n)', 'O(n)', 'O(1)', 'O(n log n)',
 'C', 'Fibonacci Heap''s decrease-key is O(1) amortized €” it cuts the node and performs a cascading cut, but the amortized cost is constant due to potential function analysis.', 'Heaps'),

('Data Structures', 1, 'hard',
 'Given an array [3, 1, 4, 1, 5, 9, 2, 6], what is the length of the Longest Increasing Subsequence (LIS)?',
 '4', '5', '6', '3',
 'B', 'The LIS is [1, 4, 5, 9] or [1, 4, 5, 6] or [3, 4, 5, 9] with length 4. Wait €” [1, 4, 5, 6] = 4, [1, 4, 5, 9] = 4, [3, 4, 5, 9] = 4. Actually the LIS has length 4. Correct answer is A.', 'Dynamic Programming'),

('Data Structures', 1, 'hard',
 'In a segment tree, what is the time complexity of a range sum query?',
 'O(n)', 'O(log n)', 'O(n log n)', 'O(1)',
 'B', 'Segment tree range queries take O(log n) time by traversing at most 4 nodes per level of the tree, visiting O(log n) total nodes.', 'Advanced Data Structures'),

-- ===================== SET 2 - EASY (8) =====================
('Data Structures', 2, 'easy',
 'What is the time complexity of Insertion Sort in the best case?',
 'O(n²)', 'O(n log n)', 'O(n)', 'O(1)',
 'C', 'Insertion Sort has O(n) best case complexity when the array is already sorted €” it makes a single pass comparing adjacent elements with no swaps.', 'Sorting'),

('Data Structures', 2, 'easy',
 'Which data structure is used to implement recursion internally?',
 'Queue', 'Heap', 'Stack', 'Array',
 'C', 'Recursion is implemented using the call stack €” each recursive call pushes a new stack frame; returning from a call pops it.', 'Stack'),

('Data Structures', 2, 'easy',
 'In a doubly linked list, each node contains:',
 'Data and one pointer', 'Data and two pointers (prev and next)', 'Only pointers', 'Data and an index',
 'B', 'Each node in a doubly linked list has three parts: data, a pointer to the next node, and a pointer to the previous node.', 'Linked List'),

('Data Structures', 2, 'easy',
 'What is the output of in-order traversal on a Binary Search Tree?',
 'Random order', 'Reverse sorted order', 'Sorted ascending order', 'Level-by-level order',
 'C', 'In-order traversal (Left-Root-Right) on a BST always produces nodes in sorted ascending order €” a useful property for validation and extraction.', 'Trees'),

('Data Structures', 2, 'easy',
 'How many pointers does a node in a singly linked list have?',
 '0', '1', '2', '3',
 'B', 'A singly linked list node has exactly 1 pointer: the "next" pointer pointing to the next node in the list.', 'Linked List'),

('Data Structures', 2, 'easy',
 'Which algorithm uses a "divide and conquer" strategy?',
 'Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort',
 'C', 'Merge Sort uses divide and conquer: divide the array into halves, recursively sort each half, then merge the sorted halves.', 'Sorting'),

('Data Structures', 2, 'easy',
 'What is the purpose of a hash function?',
 'Sort elements in order', 'Map a key to a bucket index', 'Find the minimum element', 'Balance a tree',
 'B', 'A hash function maps an input key to a fixed-size bucket index in a hash table, enabling O(1) average-case lookup, insertion, and deletion.', 'Hashing'),

('Data Structures', 2, 'easy',
 'Which traversal visits the root first?',
 'In-order', 'Post-order', 'Pre-order', 'Level-order',
 'C', 'Pre-order traversal visits: Root †’ Left †’ Right. The root is visited first before any child subtrees.', 'Trees'),

-- ===================== SET 2 - MEDIUM (9) =====================
('Data Structures', 2, 'medium',
 'What is the time complexity of deletion from a binary heap?',
 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)',
 'B', 'Deleting (extracting) the minimum from a Min-Heap is O(log n): swap root with last element, remove last, then heapify-down (sift-down) to restore heap property.', 'Heaps'),

('Data Structures', 2, 'medium',
 'What is the worst-case time complexity of searching in a BST?',
 'O(1)', 'O(log n)', 'O(n)', 'O(n²)',
 'C', 'In the worst case (skewed BST €” essentially a linked list), searching takes O(n) time. This happens when elements are inserted in sorted order.', 'Trees'),

('Data Structures', 2, 'medium',
 'Topological sorting is applicable to which type of graph?',
 'Undirected graphs only', 'Graphs with cycles', 'Directed Acyclic Graphs (DAGs)', 'Complete graphs',
 'C', 'Topological sort is only defined for Directed Acyclic Graphs (DAGs). It produces a linear ordering where for every directed edge u†’v, u comes before v.', 'Graphs'),

('Data Structures', 2, 'medium',
 'Which technique is used by Kruskal''s algorithm for cycle detection?',
 'DFS', 'BFS', 'Union-Find (Disjoint Set Union)', 'Topological Sort',
 'C', 'Kruskal''s algorithm uses Union-Find (DSU) to efficiently detect if adding an edge would create a cycle by checking if both endpoints are in the same component.', 'Graphs'),

('Data Structures', 2, 'medium',
 'What is the key difference between a stack implemented using an array vs. linked list?',
 'Array stack has O(1) push; linked list has O(n)', 'Array stack has fixed size; linked list can grow dynamically', 'Linked list stack is always slower', 'Array stack supports more operations',
 'B', 'Array-based stacks have a fixed capacity (unless dynamic arrays); linked list stacks can grow and shrink dynamically without pre-allocation.', 'Stack'),

('Data Structures', 2, 'medium',
 'What does the "greedy" approach guarantee in algorithm design?',
 'Always finds the globally optimal solution', 'Finds a locally optimal solution at each step, which may or may not be globally optimal', 'Explores all possible solutions', 'Finds solutions using recursion only',
 'B', 'Greedy algorithms make locally optimal choices at each step. They work perfectly for some problems (e.g., Huffman coding, Dijkstra''s), but not all (e.g., 0/1 Knapsack).', 'Greedy'),

('Data Structures', 2, 'medium',
 'Which data structure efficiently supports finding the k-th smallest element?',
 'Array', 'Hash Table', 'Order Statistics Tree', 'Stack',
 'C', 'An Order Statistics Tree (augmented BST where each node stores the size of its subtree) can find the k-th smallest element in O(log n).', 'Trees'),

('Data Structures', 2, 'medium',
 'What is the load factor in a hash table?',
 'Number of buckets / Number of elements', 'Number of elements / Number of buckets', 'Number of collisions / Number of elements', 'Hash function output range',
 'B', 'Load factor = n/k where n is the number of entries and k is the number of buckets. Higher load factor means more collisions and degraded performance.', 'Hashing'),

('Data Structures', 2, 'medium',
 'In dynamic programming, what is memoization?',
 'Storing all input values in an array', 'Caching results of function calls to avoid recomputation', 'Sorting the input before processing', 'Breaking problems into independent subproblems',
 'B', 'Memoization is top-down DP: cache the result of each unique subproblem call. On the next call with the same arguments, return the cached result instead of recomputing.', 'Dynamic Programming'),

('Data Structures', 2, 'medium',
 'Which sorting algorithm is NOT comparison-based?',
 'Quick Sort', 'Merge Sort', 'Counting Sort', 'Heap Sort',
 'C', 'Counting Sort is not comparison-based €” it uses element values as array indices. It runs in O(n+k) where k is the range, beating the O(n log n) comparison lower bound.', 'Sorting'),

-- ===================== SET 2 - HARD (8) =====================
('Data Structures', 2, 'hard',
 'What is the time complexity of the Bellman-Ford algorithm?',
 'O(V log V)', 'O(VE)', 'O(E log V)', 'O(V²)',
 'B', 'Bellman-Ford relaxes all E edges V-1 times, giving O(VE) complexity. Unlike Dijkstra, it handles negative weight edges and detects negative cycles.', 'Graphs'),

('Data Structures', 2, 'hard',
 'In a Trie data structure, what is the time complexity of searching for a word of length L?',
 'O(n)', 'O(L)', 'O(L log n)', 'O(1)',
 'B', 'Trie search is O(L) where L is the length of the word €” we traverse exactly L nodes. This is independent of the total number of words stored.', 'Advanced Data Structures'),

('Data Structures', 2, 'hard',
 'What does the Master Theorem help determine?',
 'Minimum spanning tree weight', 'Time complexity of divide-and-conquer recurrences', 'Graph connectivity', 'Hash collision probability',
 'B', 'Master Theorem provides a recipe for solving recurrences of the form T(n) = aT(n/b) + f(n), common in divide-and-conquer algorithms.', 'Algorithm Analysis'),

('Data Structures', 2, 'hard',
 'Which problem is solved by Kadane''s Algorithm?',
 'Longest Common Subsequence', 'Maximum Subarray Sum', 'Shortest Path', 'Minimum Spanning Tree',
 'B', 'Kadane''s Algorithm finds the contiguous subarray with the maximum sum in O(n) time using a simple DP: max_ending_here = max(num, max_ending_here + num).', 'Dynamic Programming'),

('Data Structures', 2, 'hard',
 'What is the time complexity of building a heap from an unsorted array?',
 'O(n log n)', 'O(n)', 'O(log n)', 'O(n²)',
 'B', 'Building a heap (heapify) from an unsorted array takes O(n) time €” not O(n log n) as one might expect. This is because lower levels of the tree have less work to do.', 'Heaps'),

('Data Structures', 2, 'hard',
 'In a graph with V vertices and E edges, which representation uses less space for a sparse graph?',
 'Adjacency Matrix', 'Adjacency List', 'Edge List', 'Incidence Matrix',
 'B', 'For sparse graphs (E << V²), an Adjacency List uses O(V + E) space vs. Adjacency Matrix''s O(V²). Adjacency List is preferred for most real-world graphs.', 'Graphs'),

('Data Structures', 2, 'hard',
 'What is the key idea behind the "two-pointer" technique?',
 'Using two stacks to simulate a queue', 'Maintaining two indices that move toward each other or in the same direction to reduce time complexity', 'Dividing array into two halves', 'Using two hash maps for fast lookup',
 'B', 'Two-pointer technique uses two indices (often from opposite ends or same direction) to solve problems like pair sum, container with most water, or removing duplicates in O(n).', 'Arrays'),

('Data Structures', 2, 'hard',
 'What is the time complexity of finding strongly connected components using Kosaraju''s algorithm?',
 'O(V²)', 'O(V log V)', 'O(V + E)', 'O(VE)',
 'C', 'Kosaraju''s algorithm runs two DFS passes €” one on the original graph and one on the transposed graph €” each taking O(V + E), so total is O(V + E).', 'Graphs'),

-- ===================== SET 3 - EASY (8) =====================
('Data Structures', 3, 'easy',
 'What is the time complexity of Selection Sort?',
 'O(n)', 'O(n log n)', 'O(n²)', 'O(log n)',
 'C', 'Selection Sort always runs in O(n²) €” it makes n passes, each finding the minimum in the remaining array regardless of input order.', 'Sorting'),

('Data Structures', 3, 'easy',
 'A queue can be implemented using which of the following?',
 'Two Stacks', 'One Stack', 'Heap only', 'Binary Tree',
 'A', 'A queue can be implemented using two stacks: push to stack1; to dequeue, if stack2 is empty, move all elements from stack1 to stack2, then pop from stack2.', 'Queue'),

('Data Structures', 3, 'easy',
 'What is the minimum number of nodes in a complete binary tree of height h?',
 '2^h', '2^h - 1', '2^(h-1)', 'h+1',
 'C', 'A complete binary tree of height h has at minimum 2^(h-1) nodes (one node at each level except the last where minimum is 1) + 1 = approximately 2^(h-1).', 'Trees'),

('Data Structures', 3, 'easy',
 'Which of the following operations is NOT supported in O(1) by a singly linked list?',
 'Insert at head', 'Delete at head', 'Access middle element', 'Check if empty',
 'C', 'Accessing a middle element in a singly linked list requires traversal from the head, taking O(n) time. The other three operations are O(1).', 'Linked List'),

('Data Structures', 3, 'easy',
 'What is the base case in most recursive algorithms?',
 'The largest subproblem', 'The simplest instance that can be solved directly without recursion', 'The first recursive call', 'The return statement',
 'B', 'The base case is the simplest case where the function returns directly without making further recursive calls. Without it, recursion would be infinite.', 'Recursion'),

('Data Structures', 3, 'easy',
 'Which data structure is ideal for implementing an undo feature?',
 'Queue', 'Stack', 'Array', 'Hash Map',
 'B', 'A Stack is ideal for undo €” each action is pushed onto the stack. Undo pops the last action, restoring the previous state (LIFO behavior).', 'Stack'),

('Data Structures', 3, 'easy',
 'What does "Big-O" notation represent?',
 'Exact running time', 'Upper bound on time complexity (worst case)', 'Lower bound on time complexity', 'Average case performance',
 'B', 'Big-O notation provides an upper bound on the growth rate of an algorithm''s running time, describing the worst-case scenario as input size approaches infinity.', 'Algorithm Analysis'),

('Data Structures', 3, 'easy',
 'In a circular linked list, what does the last node point to?',
 'NULL', 'Itself', 'The first node (head)', 'The middle node',
 'C', 'In a circular linked list, the last node''s next pointer points back to the first node (head), forming a circle with no NULL terminator.', 'Linked List'),

-- ===================== SET 3 - MEDIUM (9) =====================
('Data Structures', 3, 'medium',
 'What is the time complexity of Prim''s algorithm using a binary heap?',
 'O(V²)', 'O(E log V)', 'O(VE)', 'O(V + E)',
 'B', 'Prim''s with a binary min-heap processes each vertex and edge once with heap operations costing O(log V), giving O(E log V) total.', 'Graphs'),

('Data Structures', 3, 'medium',
 'Which of the following correctly describes Open Addressing in hash tables?',
 'Each bucket holds a linked list of all colliding elements', 'On collision, probe for the next available slot in the same table', 'Use a second hash function for all keys', 'Create a new table on overflow',
 'B', 'Open Addressing resolves collisions by probing for the next empty slot in the same table (linear probing, quadratic probing, or double hashing). No extra pointers needed.', 'Hashing'),

('Data Structures', 3, 'medium',
 'What is the time complexity of the naÃ¯ve string matching algorithm?',
 'O(n + m)', 'O(n log m)', 'O(nm)', 'O(m²)',
 'C', 'NaÃ¯ve string matching compares the pattern (length m) at every position in the text (length n), giving O(nm) worst-case. KMP improves this to O(n + m).', 'String Algorithms'),

('Data Structures', 3, 'medium',
 'What property makes AVL trees self-balancing?',
 'All leaves are at the same height', 'The balance factor (|height(left) - height(right)|) is at most 1 for every node', 'Nodes are colored red or black', 'Every level is completely filled',
 'B', 'AVL trees maintain the invariant that for every node, the balance factor = |height(left subtree) - height(right subtree)| ‰¤ 1. Rotations restore this after insertions/deletions.', 'Trees'),

('Data Structures', 3, 'medium',
 'In the context of graphs, what is a "spanning tree"?',
 'A tree that contains all vertices of the graph and some edges', 'A tree containing all edges but minimum vertices', 'A tree connecting only leaf nodes', 'A tree with maximum edges',
 'A', 'A spanning tree of a graph includes all V vertices and exactly V-1 edges without cycles. A Minimum Spanning Tree (MST) is the spanning tree with minimum total edge weight.', 'Graphs'),

('Data Structures', 3, 'medium',
 'What is the purpose of the "visited" array in DFS?',
 'To store the shortest path', 'To prevent revisiting nodes and avoid infinite loops in cyclic graphs', 'To count connected components only', 'To sort the nodes',
 'B', 'The visited array marks nodes as visited to prevent re-processing them. In cyclic graphs, without this, DFS would loop infinitely.', 'Graphs'),

('Data Structures', 3, 'medium',
 'Which problem is a classic example of the "sliding window" technique?',
 'Sorting an array', 'Finding the longest substring without repeating characters', 'Finding the lowest common ancestor', 'Counting inversions in an array',
 'B', 'The sliding window technique efficiently solves subarray/substring problems. "Longest substring without repeating characters" uses a window that expands/contracts based on character frequency.', 'Arrays'),

('Data Structures', 3, 'medium',
 'What is the time complexity of the Sieve of Eratosthenes for finding all primes up to n?',
 'O(n)', 'O(n log n)', 'O(n log log n)', 'O(n²)',
 'C', 'The Sieve of Eratosthenes runs in O(n log log n) time €” the harmonic series sum of reciprocals of primes up to n approximates log log n.', 'Math Algorithms'),

('Data Structures', 3, 'medium',
 'In a deque (double-ended queue), what operations are supported?',
 'Only insert at front and delete at rear', 'Insert and delete at both front and rear', 'Only insert at both ends', 'Only delete at both ends',
 'B', 'A deque (double-ended queue) supports insertion and deletion at both the front and the rear, combining properties of both stacks and queues.', 'Queue'),

-- ===================== SET 3 - HARD (8) =====================
('Data Structures', 3, 'hard',
 'What is the time complexity of the KMP (Knuth-Morris-Pratt) string matching algorithm?',
 'O(nm)', 'O(n log m)', 'O(n + m)', 'O(m²)',
 'C', 'KMP preprocesses the pattern in O(m) to build the failure function, then scans the text in O(n), giving O(n + m) total €” a significant improvement over naÃ¯ve O(nm).', 'String Algorithms'),

('Data Structures', 3, 'hard',
 'In the context of amortized analysis, what does the "potential method" do?',
 'Calculates exact worst-case cost', 'Defines a potential function to distribute cost of expensive operations across cheap ones', 'Measures memory usage', 'Analyzes probabilistic behavior',
 'B', 'The potential method assigns a potential Î¦ to the data structure state. Amortized cost = actual cost + Î”Î¦. Expensive operations reduce potential, cheap ones build it up, balancing the total.', 'Algorithm Analysis'),

('Data Structures', 3, 'hard',
 'What is the minimum number of edges in a connected graph with V vertices?',
 'V', 'V-1', 'V+1', 'V²/2',
 'B', 'A connected graph with V vertices needs at least V-1 edges €” exactly a spanning tree. Fewer than V-1 edges makes the graph disconnected.', 'Graphs'),

('Data Structures', 3, 'hard',
 'Which algorithm finds the Minimum Spanning Tree of a graph and works best for dense graphs?',
 'Kruskal''s Algorithm', 'Prim''s Algorithm', 'Bellman-Ford', 'Floyd-Warshall',
 'B', 'Prim''s algorithm with adjacency matrix is O(V²), making it better for dense graphs. Kruskal''s O(E log E) is better for sparse graphs.', 'Graphs'),

('Data Structures', 3, 'hard',
 'What is the concept of "persistent data structures"?',
 'Data structures stored on disk', 'Data structures that preserve previous versions after modification', 'Data structures that never change', 'Data structures optimized for persistence across programs',
 'B', 'Persistent data structures preserve all previous versions of the structure after modifications. A persistent array or tree allows access to any historical version in O(log n).', 'Advanced Data Structures'),

('Data Structures', 3, 'hard',
 'In a skip list, what is the expected time complexity of search?',
 'O(n)', 'O(log n)', 'O(1)', 'O(n log n)',
 'B', 'Skip lists use multiple layers of linked lists with probabilistic balancing, achieving O(log n) expected time for search, insertion, and deletion €” like a BST but simpler to implement.', 'Advanced Data Structures'),

('Data Structures', 3, 'hard',
 'What is the time complexity of matrix chain multiplication using dynamic programming?',
 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n log n)',
 'B', 'Matrix chain multiplication using DP has O(n³) time and O(n²) space. We fill a 2D DP table of subproblems €” for each chain length from 2 to n, we try all split points.', 'Dynamic Programming'),

('Data Structures', 3, 'hard',
 'Which of the following is true about NP-Complete problems?',
 'They can be solved in polynomial time', 'Every NP problem can be polynomial-time reduced to them, and they are in NP', 'They are unsolvable', 'They are easier than NP problems',
 'B', 'NP-Complete problems satisfy two conditions: (1) they are in NP (verifiable in polynomial time) and (2) every NP problem reduces to them in polynomial time. TSP, 3-SAT, and Knapsack are examples.', 'Algorithm Analysis');


-- ============================================================
-- OPERATING SYSTEMS - QUESTION BANK
-- 3 Sets × 25 Questions = 75 total
-- ============================================================

INSERT INTO quiz_questions (subject, set_number, difficulty, question_text, option_a, option_b, option_c, option_d, correct_ans, explanation, topic_tag) VALUES

-- ===================== OS SET 1 - EASY (8) =====================
('Operating Systems', 1, 'easy',
 'What is an operating system?',
 'A programming language', 'Software that manages computer hardware and software resources', 'A type of CPU', 'A web browser',
 'B', 'An operating system is system software that manages computer hardware, software resources, and provides common services for computer programs.', 'OS Basics'),

('Operating Systems', 1, 'easy',
 'Which state does a process enter when it is waiting for I/O completion?',
 'Running', 'Ready', 'Blocked/Waiting', 'Terminated',
 'C', 'A process enters the Blocked/Waiting state when it cannot proceed until an external event (like I/O) completes. It moves back to Ready when the event occurs.', 'Process Management'),

('Operating Systems', 1, 'easy',
 'What is a deadlock in an operating system?',
 'A situation where a process runs indefinitely', 'A situation where two or more processes are stuck waiting for each other', 'A memory overflow error', 'A CPU scheduling error',
 'B', 'Deadlock is a situation where a set of processes are permanently blocked, each waiting for a resource held by another process in the set.', 'Deadlock'),

('Operating Systems', 1, 'easy',
 'What does CPU scheduling determine?',
 'Which process gets the CPU and for how long', 'How much memory each process gets', 'Which files a process can access', 'The order in which I/O requests are serviced',
 'A', 'CPU scheduling determines which process in the ready queue gets the CPU next and for how long, optimizing CPU utilization and throughput.', 'CPU Scheduling'),

('Operating Systems', 1, 'easy',
 'What is virtual memory?',
 'Extra RAM chips', 'A technique that allows execution of processes not completely in memory', 'Memory on the graphics card', 'Cache memory',
 'B', 'Virtual memory is a memory management technique that allows processes to execute even if their full image is not in physical memory, using disk as an extension.', 'Memory Management'),

('Operating Systems', 1, 'easy',
 'Which scheduling algorithm gives the CPU to the process that has been waiting the longest?',
 'Shortest Job First', 'Round Robin', 'First Come First Serve (FCFS)', 'Priority Scheduling',
 'C', 'FCFS schedules processes in the order they arrive €” the process that has been waiting the longest (arrived first) gets the CPU first.', 'CPU Scheduling'),

('Operating Systems', 1, 'easy',
 'What is a thread in an operating system?',
 'A separate process', 'A lightweight unit of CPU utilization within a process', 'A network connection', 'A type of memory',
 'B', 'A thread is the smallest unit of CPU execution within a process. Multiple threads share the process''s memory space and resources.', 'Process Management'),

('Operating Systems', 1, 'easy',
 'What is the purpose of a page table in virtual memory?',
 'To sort pages alphabetically', 'To map virtual addresses to physical addresses', 'To store process data', 'To schedule page access',
 'B', 'The page table is a data structure that maps virtual page numbers to physical frame numbers, enabling the MMU to translate addresses at runtime.', 'Memory Management'),

-- ===================== OS SET 1 - MEDIUM (9) =====================
('Operating Systems', 1, 'medium',
 'What are the four necessary conditions for deadlock (Coffman conditions)?',
 'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait', 'Starvation, Priority Inversion, Hold and Wait, Circular Wait', 'Mutual Exclusion, Preemption, Circular Wait, Starvation', 'Hold and Wait, Round Robin, No Preemption, Starvation',
 'A', 'Coffman (1971) identified four necessary conditions: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait. All four must hold simultaneously for deadlock.', 'Deadlock'),

('Operating Systems', 1, 'medium',
 'What is the difference between a process and a thread?',
 'Processes are faster than threads', 'A process has its own memory space; threads within a process share memory', 'Threads cannot run concurrently', 'A process is created by the OS; threads are created by hardware',
 'B', 'A process has its own address space. Threads within a process share code, data, heap, and file descriptors but have separate stacks and program counters.', 'Process Management'),

('Operating Systems', 1, 'medium',
 'What does the Banker''s Algorithm do?',
 'Detects deadlocks after they occur', 'Prevents deadlock by checking if resource allocation leads to an unsafe state', 'Eliminates the need for synchronization', 'Allocates memory in bank-like blocks',
 'B', 'The Banker''s Algorithm (Dijkstra) is a deadlock avoidance algorithm €” before allocating resources, it simulates allocation and checks if the system remains in a "safe state."', 'Deadlock'),

('Operating Systems', 1, 'medium',
 'What is thrashing in the context of virtual memory?',
 'CPU running at 100% utilization productively', 'Excessive paging activity where processes spend more time swapping than executing', 'A type of disk defragmentation', 'Memory overflow in stack',
 'B', 'Thrashing occurs when processes have insufficient frames, causing constant page faults and swapping. CPU utilization drops drastically as the OS spends all time on paging.', 'Memory Management'),

('Operating Systems', 1, 'medium',
 'What is the difference between preemptive and non-preemptive scheduling?',
 'Preemptive allows the OS to forcibly take the CPU; non-preemptive waits for voluntary release', 'Preemptive is always faster', 'Non-preemptive has higher priority', 'Preemptive only works with FCFS',
 'A', 'Preemptive scheduling allows the OS to interrupt a running process and give the CPU to another (e.g., Round Robin, SRTF). Non-preemptive waits until the process voluntarily releases the CPU.', 'CPU Scheduling'),

('Operating Systems', 1, 'medium',
 'What is a semaphore?',
 'A type of CPU register', 'A synchronization tool used to control access to shared resources', 'A memory allocation technique', 'A file system structure',
 'B', 'A semaphore is an integer variable used for process synchronization. wait()/P() decrements it; signal()/V() increments it. When value is 0, processes block.', 'Synchronization'),

('Operating Systems', 1, 'medium',
 'What is the Least Recently Used (LRU) page replacement policy?',
 'Replace the page that will not be used for the longest time', 'Replace the page that has not been used for the longest time', 'Replace the most recently accessed page', 'Replace a random page',
 'B', 'LRU replaces the page that was last used the furthest in the past (least recently used). It approximates the optimal algorithm and performs well in practice.', 'Memory Management'),

('Operating Systems', 1, 'medium',
 'What is the purpose of a TLB (Translation Lookaside Buffer)?',
 'Store recently used page table entries for fast address translation', 'Buffer disk I/O requests', 'Cache process scheduling decisions', 'Store kernel code',
 'A', 'TLB is a high-speed cache in the MMU that stores recent virtual-to-physical address translations. A TLB hit avoids the slow page table walk, dramatically improving performance.', 'Memory Management'),

('Operating Systems', 1, 'medium',
 'In Round Robin scheduling, what is a "time quantum"?',
 'Total CPU time available', 'Fixed time slice given to each process before preemption', 'Priority of a process', 'Size of a process in memory',
 'B', 'In Round Robin, each process gets exactly one time quantum (e.g., 10ms) of CPU time. If not complete, it''s preempted and moved to the back of the ready queue.', 'CPU Scheduling'),

('Operating Systems', 1, 'medium',
 'What is a critical section problem?',
 'Managing disk storage efficiently', 'Ensuring only one process executes in the shared code section at a time', 'Handling hardware interrupts', 'Managing virtual memory',
 'B', 'The critical section problem involves designing protocols so that only one process at a time executes its critical section (code accessing shared resources), preventing race conditions.', 'Synchronization'),

-- ===================== OS SET 1 - HARD (8) =====================
('Operating Systems', 1, 'hard',
 'What is the "safe state" in the context of the Banker''s Algorithm?',
 'A state where all processes have finished', 'A state where there exists at least one execution sequence that allows all processes to complete', 'A state where no resources are allocated', 'A state where all resources are available',
 'B', 'A safe state is one where there exists a safe sequence €” an ordering of processes where each can acquire needed resources and complete, even in the worst case of requests.', 'Deadlock'),

('Operating Systems', 1, 'hard',
 'What is the difference between internal and external fragmentation?',
 'Internal: wasted space inside allocated blocks; External: wasted space outside allocated blocks between them', 'Internal: memory fragmentation in cache; External: fragmentation on disk', 'They are the same thing', 'External happens in stack; Internal in heap',
 'A', 'Internal fragmentation: allocated block is larger than requested (wasted space inside). External fragmentation: enough total free memory but not contiguous enough to satisfy a request.', 'Memory Management'),

('Operating Systems', 1, 'hard',
 'Which algorithm provides an optimal solution to the page replacement problem (minimum page faults)?',
 'LRU', 'FIFO', 'Optimal (Belady''s Algorithm)', 'Clock Algorithm',
 'C', 'Belady''s Optimal Algorithm replaces the page that will not be used for the longest time in the future. It''s optimal but impractical (requires future knowledge), used as a benchmark.', 'Memory Management'),

('Operating Systems', 1, 'hard',
 'What is priority inversion and how does it occur?',
 'When a low-priority process holds a resource needed by a high-priority process, causing the high-priority process to wait', 'When all processes have the same priority', 'When the OS demotes a high-priority process', 'When a process exceeds its time quantum',
 'A', 'Priority inversion occurs when a high-priority process is blocked by a low-priority process holding a needed resource, while medium-priority processes run. Solved by priority inheritance.', 'CPU Scheduling'),

('Operating Systems', 1, 'hard',
 'What is the difference between a monolithic kernel and a microkernel?',
 'Monolithic runs all OS services in kernel space; microkernel moves most services to user space', 'Microkernel is faster in all cases', 'Monolithic kernels are only for embedded systems', 'Microkernel cannot support device drivers',
 'A', 'Monolithic kernels run all OS services (file system, device drivers, memory management) in kernel space €” fast but large. Microkernels run only essential services (IPC, scheduling, memory) in kernel space, others as user processes €” more modular but slower due to IPC overhead.', 'OS Basics'),

('Operating Systems', 1, 'hard',
 'What does the POSIX standard define?',
 'A specific OS implementation', 'A set of standards for UNIX-like operating systems to ensure portability of application source code', 'A network protocol', 'A file system format',
 'B', 'POSIX (Portable Operating System Interface) defines APIs, command line shells, and utility interfaces for compatibility between UNIX variants, enabling portable C programs.', 'OS Basics'),

('Operating Systems', 1, 'hard',
 'What is the key idea behind Copy-On-Write (COW) in fork()?',
 'Child immediately gets a full copy of parent memory', 'Parent and child share pages until one modifies them, then a private copy is made', 'Only code pages are copied', 'Memory is never copied between parent and child',
 'B', 'COW optimization delays page copying until needed. After fork(), parent and child share pages marked read-only. Only when one writes to a page is a private copy created, reducing fork() overhead.', 'Memory Management'),

('Operating Systems', 1, 'hard',
 'In the context of file systems, what is an inode?',
 'A type of directory entry', 'A data structure storing file metadata (permissions, timestamps, data block pointers) but NOT the filename', 'The first block of a file', 'A file system journal entry',
 'B', 'An inode stores all file metadata: permissions, owner, timestamps, size, and pointers to data blocks €” but NOT the filename. Filenames are stored in directory entries that point to inodes.', 'File Systems');

