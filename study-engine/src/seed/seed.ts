import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Topic, TopicCategory } from '../topics/entities/topic.entity';
import { Question, QuestionType } from '../questions/entities/question.entity';

interface SeedQuestion {
  title: string;
  prompt: string;
  difficulty?: string;
  hints?: string[];
}
interface SeedTopic {
  category: TopicCategory;
  name: string;
  slug: string;
  difficulty?: string;
  description?: string;
  type: QuestionType;
  questions: SeedQuestion[];
}

const DSA: SeedTopic[] = [
  {
    category: 'dsa', name: 'Two Pointer', slug: 'two-pointer', difficulty: 'easy', type: 'coding',
    description: 'Use two indices moving toward/with each other to avoid nested loops.',
    questions: [
      { title: 'Two Sum II (sorted)', prompt: 'Given a sorted array, return indices of two numbers adding to target.', difficulty: 'easy', hints: ['Move pointers based on sum vs target'] },
      { title: 'Valid Palindrome', prompt: 'Check if a string is a palindrome considering only alphanumerics.', difficulty: 'easy' },
      { title: 'Container With Most Water', prompt: 'Find two lines forming a container holding the most water.', difficulty: 'medium' },
    ],
  },
  {
    category: 'dsa', name: 'Sliding Window', slug: 'sliding-window', difficulty: 'medium', type: 'coding',
    description: 'Maintain a moving window over a sequence to track a running property.',
    questions: [
      { title: 'Longest Substring Without Repeating Characters', prompt: 'Length of the longest substring with all unique characters.', difficulty: 'medium' },
      { title: 'Maximum Sum Subarray of Size K', prompt: 'Max sum of any contiguous subarray of size k.', difficulty: 'easy' },
    ],
  },
  {
    category: 'dsa', name: 'Binary Search', slug: 'binary-search', difficulty: 'medium', type: 'coding',
    description: 'Halve the search space each step on a monotonic property.',
    questions: [
      { title: 'Search in Rotated Sorted Array', prompt: 'Search a target in a rotated sorted array in O(log n).', difficulty: 'medium' },
      { title: 'Find First and Last Position', prompt: 'Find start and end indices of a target value.', difficulty: 'medium' },
    ],
  },
  {
    category: 'dsa', name: 'BFS', slug: 'bfs', difficulty: 'medium', type: 'coding',
    description: 'Level-order traversal using a queue; shortest path in unweighted graphs.',
    questions: [
      { title: 'Binary Tree Level Order Traversal', prompt: 'Return node values level by level.', difficulty: 'medium' },
      { title: 'Rotting Oranges', prompt: 'Minutes until all oranges rot (multi-source BFS).', difficulty: 'medium' },
    ],
  },
  {
    category: 'dsa', name: 'DFS', slug: 'dfs', difficulty: 'medium', type: 'coding',
    description: 'Depth-first exploration via recursion/stack; connectivity & cycles.',
    questions: [
      { title: 'Number of Islands', prompt: 'Count connected components of land in a grid.', difficulty: 'medium' },
      { title: 'Course Schedule', prompt: 'Detect if all courses can be finished (cycle detection).', difficulty: 'medium' },
    ],
  },
  {
    category: 'dsa', name: 'Dynamic Programming', slug: 'dynamic-programming', difficulty: 'hard', type: 'coding',
    description: 'Break into overlapping subproblems; memoize or tabulate.',
    questions: [
      { title: 'Climbing Stairs', prompt: 'Number of ways to climb n stairs taking 1 or 2 steps.', difficulty: 'easy' },
      { title: 'Coin Change', prompt: 'Fewest coins to make an amount.', difficulty: 'medium' },
      { title: 'Longest Common Subsequence', prompt: 'Length of the LCS of two strings.', difficulty: 'medium' },
    ],
  },
  {
    category: 'dsa', name: 'Backtracking', slug: 'backtracking', difficulty: 'medium', type: 'coding',
    description: 'Build candidates incrementally and abandon dead ends.',
    questions: [
      { title: 'Subsets', prompt: 'Generate all subsets of a set.', difficulty: 'medium' },
      { title: 'Permutations', prompt: 'Generate all permutations of distinct integers.', difficulty: 'medium' },
      { title: 'N-Queens', prompt: 'Place n queens so none attack each other.', difficulty: 'hard' },
    ],
  },
  {
    category: 'dsa', name: 'Hashing', slug: 'hashing', difficulty: 'easy', type: 'coding',
    description: 'Use hash maps/sets for O(1) lookups.',
    questions: [
      { title: 'Two Sum', prompt: 'Return indices of two numbers adding to target.', difficulty: 'easy' },
      { title: 'Group Anagrams', prompt: 'Group strings that are anagrams of each other.', difficulty: 'medium' },
    ],
  },
];

const SYSTEM_DESIGN: SeedTopic[] = [
  {
    category: 'system-design', name: 'Core System Design', slug: 'core-system-design', type: 'system-design',
    description: 'Classic large-scale design problems — draw the architecture.',
    questions: [
      { title: 'Design a URL Shortener', prompt: 'Design a service like bit.ly. Cover API, key generation, storage, caching, scale.', difficulty: 'medium' },
      { title: 'Design a Rate Limiter', prompt: 'Design a distributed rate limiter. Cover algorithm, storage, accuracy vs cost.', difficulty: 'medium' },
      { title: 'Design a Chat Application', prompt: 'Design real-time messaging. Cover delivery, presence, fan-out, storage.', difficulty: 'hard' },
      { title: 'Design a News Feed', prompt: 'Design a social feed. Cover fan-out on write vs read, ranking, caching.', difficulty: 'hard' },
    ],
  },
  {
    category: 'system-design', name: 'GenAI System Design', slug: 'genai-system-design', type: 'system-design',
    description: 'LLM-era design problems.',
    questions: [
      { title: 'Design a RAG-based Q&A System', prompt: 'Design retrieval-augmented Q&A over private docs. Cover ingestion, chunking, vector store, retrieval, guardrails, cost.', difficulty: 'hard' },
      { title: 'Design a Semantic Search Service', prompt: 'Design embeddings-based search at scale. Cover indexing, ANN, freshness, hybrid ranking.', difficulty: 'medium' },
    ],
  },
];

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const topicRepo = app.get<Repository<Topic>>(getRepositoryToken(Topic));
  const questionRepo = app.get<Repository<Question>>(getRepositoryToken(Question));

  let topicCount = 0;
  let questionCount = 0;

  for (const [i, t] of [...DSA, ...SYSTEM_DESIGN].entries()) {
    let topic = await topicRepo.findOne({ where: { slug: t.slug } });
    if (!topic) {
      topic = await topicRepo.save(
        topicRepo.create({
          category: t.category,
          name: t.name,
          slug: t.slug,
          difficulty: t.difficulty ?? null,
          description: t.description ?? null,
          sortOrder: i,
        }),
      );
      topicCount++;
    }
    for (const q of t.questions) {
      const exists = await questionRepo.findOne({
        where: { title: q.title, topic: { id: topic.id } },
      });
      if (!exists) {
        await questionRepo.save(
          questionRepo.create({
            type: t.type,
            title: q.title,
            prompt: q.prompt,
            difficulty: q.difficulty ?? null,
            hints: q.hints ?? null,
            topic: { id: topic.id },
          }),
        );
        questionCount++;
      }
    }
  }

  console.log(`✅ Seed complete — +${topicCount} topics, +${questionCount} questions`);
  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
