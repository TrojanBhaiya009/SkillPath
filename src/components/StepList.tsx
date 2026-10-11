"use client";

import type { PathStep } from "@/lib/schema";

export function StepList({ steps }: { steps: PathStep[] }) {
  if (steps.length === 0) {
    return (
      <div className="panel p-6 text-center">
        <p className="text-muted">No missing skills for this role.</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="px-4 py-3 border-b border-line">
        <h2 className="font-display-bold text-lg text-text">Learning Path ({steps.length} steps)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left text-xs font-body-medium text-muted uppercase tracking-wider w-12 tabular-nums">Step</th>
              <th className="px-4 py-3 text-left text-xs font-body-medium text-muted uppercase tracking-wider">Skill</th>
              <th className="px-4 py-3 text-left text-xs font-body-medium text-muted uppercase tracking-wider">Course</th>
              <th className="px-4 py-3 text-left text-xs font-body-medium text-muted uppercase tracking-wider w-24 tabular-nums">Weeks</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <tr key={step.skill} className="border-b border-line/50 last:border-0 hover:bg-line/30 transition-colors">
                <td className="px-4 py-3 text-text font-code tabular-nums text-sm">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-text font-body-medium">{step.skill}</td>
                <td className="px-4 py-3">
                  {step.course ? (
                    <span className="text-text">{step.course.name}</span>
                  ) : (
                    <span className="text-muted">No course in the data yet</span>
                  )}
                </td>
                <td className="px-4 py-3 font-code tabular-nums text-sm">
                  {step.course?.weeks ? (
                    <span className="text-text">{step.course.weeks}</span>
                  ) : (
                    <span className="text-muted">Duration not stated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}