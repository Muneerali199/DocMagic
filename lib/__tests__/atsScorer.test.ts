import { calculateATSScore } from "../atsScorer";

describe("calculateATSScore", () => {
  it("handles an empty resume without throwing", () => {
    expect(() => calculateATSScore({})).not.toThrow();

    const result = calculateATSScore({});

    expect(result.score).toBeLessThan(60);
    expect(result.grade).toBe("F");
    expect(result.improvements.length).toBeGreaterThan(0);
  });
  it("gives a high score to a well-structured resume", () => {
    const resume = {
      personalInfo: {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "9876543210",
        location: "Bangalore",
      },
      professionalSummary:
        "Experienced full-stack developer with over five years of experience building scalable web applications using React, Node.js, TypeScript, and cloud technologies.",
      experience: [
        {
          achievements: [
            "Increased performance by 35%",
            "Reduced costs by $20000",
            "Led a team of 10+ engineers",
          ],
        },
        {
          achievements: [
            "Improved test coverage by 40%",
            "Delivered 15+ projects",
            "Reduced bugs by 50%",
          ],
        },
      ],
      education: [
        {
          degree: "B.Tech",
          gpa: "8.9",
        },
      ],
      skills: {
        technical: ["React", "Node.js", "TypeScript", "Next.js", "MongoDB"],
        soft: ["Leadership", "Communication", "Problem Solving"],
        tools: ["Git", "Docker", "AWS"],
      },
      certifications: ["AWS Certified Developer"],
    };

    const result = calculateATSScore(resume);

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.grade).toBe("A");
  });
  it("suggests missing contact information", () => {
    const result = calculateATSScore({});

    expect(result.improvements).toContain("Add your full name");
    expect(result.improvements).toContain("Add a professional email");
    expect(result.improvements).toContain("Add phone number");
    expect(result.improvements).toContain("Add your location");
  });
  it("recommends adding measurable achievements", () => {
    const resume = {
      experience: [
        {
          achievements: ["Worked on frontend", "Built dashboards"],
        },
      ],
    };

    const result = calculateATSScore(resume);

    expect(result.improvements).toContain(
      "Add numbers/metrics to achievements (e.g., 'increased sales by 25%')",
    );
  });
  it("awards more points for comprehensive skills", () => {
    const lowSkills = calculateATSScore({
      skills: {
        technical: ["React"],
      },
    });

    const highSkills = calculateATSScore({
      skills: {
        technical: ["React", "Node.js", "TypeScript", "Next.js", "MongoDB"],
        soft: ["Leadership", "Communication", "Problem Solving"],
        tools: ["Git", "Docker", "AWS"],
      },
    });

    expect(highSkills.score).toBeGreaterThan(lowSkills.score);
  });
});
