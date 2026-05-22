export type Tool = {
  slug: string;
  name: string;
  blurb: string;
  status: "live" | "coming-soon";
  source?: string;
};

export type Category = {
  slug: string;
  name: string;
  tools: Tool[];
};

export const categories: Category[] = [
  {
    slug: "photography-and-computation",
    name: "Photography and Computation",
    tools: [
      {
        slug: "abacus",
        name: "Abacus Base",
        blurb: "A base-aware abacus for thinking about number systems.",
        status: "live",
        source: "https://github.com/taipinc/Abacus_Base",
      },
      {
        slug: "perceptron",
        name: "Perceptron Simulator",
        blurb:
          "Train a single perceptron and watch the decision boundary move.",
        status: "live",
        source: "https://github.com/taipinc/perceptron-simulator",
      },
      {
        slug: "logic-gates",
        name: "Logic Gate Simulator",
        blurb: "Wire up gates and play with truth tables on a canvas.",
        status: "live",
        source: "https://github.com/taipinc/logic-gate-simulator",
      },
      {
        slug: "image-displacer",
        name: "Image Displacer",
        blurb: "Push pixels around with a displacement map in 3D.",
        status: "live",
        source: "https://github.com/taipinc/image-displacer",
      },
    ],
  },
  {
    slug: "digital-photo-lab",
    name: "Digital Photo Lab",
    tools: [
      {
        slug: "exposure-bucket",
        name: "Exposure Bucket",
        blurb:
          "Rain, a bucket, and a metaphor for how photographic exposure works.",
        status: "live",
      },
    ],
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);

export function findTool(
  slug: string,
): { tool: Tool; category: Category } | undefined {
  for (const category of categories) {
    const tool = category.tools.find((t) => t.slug === slug);
    if (tool) return { tool, category };
  }
  return undefined;
}
