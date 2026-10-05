import { useMemo, useState } from 'react';

export default function AnalyticsDashboard({ tasks, total }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(4); // default to Friday

  // Compute live breakdown statistics
  const stats = useMemo(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    const assignees = {};

    tasks.forEach((t) => {
      const s = (t.status || '').toUpperCase();
      if (s === 'OPEN') todo++;
      else if (s === 'IN_PROGRESS') inProgress++;
      else if (s === 'DONE') done++;

      const p = (t.priority || '').toUpperCase();
      if (p === 'HIGH') high++;
      else if (p === 'MEDIUM') medium++;
      else if (p === 'LOW') low++;

      const a = t.assignee || 'Unassigned';
      assignees[a] = (assignees[a] || 0) + 1;
    });

    const currentTotal = tasks.length || 1;
    const completionRate = Math.round((done / currentTotal) * 100);

    return {
      todo,
      inProgress,
      done,
      high,
      medium,
      low,
      completionRate,
      assignees: Object.entries(assignees).sort((a, b) => b[1] - a[1]),
    };
  }, [tasks]);

  // Donut chart calculations
  const totalCount = Math.max(tasks.length, 1);
  const todoPct = (stats.todo / totalCount) * 100;
  const progressPct = (stats.inProgress / totalCount) * 100;
  const donePct = (stats.done / totalCount) * 100;

  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12

  const doneStroke = (donePct / 100) * circumference;
  const progressStroke = (progressPct / 100) * circumference;
  const todoStroke = (todoPct / 100) * circumference;

  // Velocity Area Graph mock data based on current task activity
  const velocityData = [
    { day: 'Mon', completed: 3, planned: 5 },
    { day: 'Tue', completed: 6, planned: 7 },
    { day: 'Wed', completed: 8, planned: 8 },
    { day: 'Thu', completed: 11, planned: 10 },
    { day: 'Fri', completed: 15, planned: 12 },
    { day: 'Sat', completed: 18, planned: 14 },
    { day: 'Sun', completed: 22, planned: 15 },
  ];

  return (
    <div className="analytics-dashboard">
      {/* Top Overview KPI Row */}
      <div className="analytics-kpi-row">
        <div className="stat-card">
          <div className="stat-card-title">COMPLETION RATE</div>
          <div className="stat-card-num text-emerald">{stats.completionRate}%</div>
          <div className="stat-card-foot">
            <span className="foot-indicator positive">▲ +8.2%</span> vs last sprint
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">ACTIVE WORKLOAD</div>
          <div className="stat-card-num text-amber">{stats.inProgress}</div>
          <div className="stat-card-foot">Tasks currently in execution</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">PENDING / TO DO</div>
          <div className="stat-card-num text-cyan">{stats.todo}</div>
          <div className="stat-card-foot">Ready for sprint triage</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">TOTAL REGISTERED</div>
          <div className="stat-card-num text-indigo">{total}</div>
          <div className="stat-card-foot">All database tasks</div>
        </div>
      </div>

      {/* Main Graphs Grid */}
      <div className="analytics-charts-grid">
        {/* Chart 1: Donut Chart - Status Breakdown */}
        <div className="chart-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Status Breakdown</h3>
              <p className="chart-subtitle">Real-time distribution across task lifecycle</p>
            </div>
            <span className="live-tag">LIVE SYNC</span>
          </div>

          <div className="donut-chart-wrapper">
            <div className="donut-container">
              <svg width="220" height="220" viewBox="0 0 180 180" className="donut-svg">
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="18"
                />

                {/* Completed (Emerald) */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray={`${doneStroke} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredSegment('Completed')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* In Progress (Amber) */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#fbbf24"
                  strokeWidth="18"
                  strokeDasharray={`${progressStroke} ${circumference}`}
                  strokeDashoffset={-doneStroke}
                  strokeLinecap="round"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredSegment('In Progress')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* To Do (Cyan) */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#38bdf8"
                  strokeWidth="18"
                  strokeDasharray={`${todoStroke} ${circumference}`}
                  strokeDashoffset={-(doneStroke + progressStroke)}
                  strokeLinecap="round"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredSegment('To Do')}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              </svg>

              <div className="donut-center-info">
                <div className="donut-center-pct">{stats.completionRate}%</div>
                <div className="donut-center-lbl">
                  {hoveredSegment ? hoveredSegment : 'Completed'}
                </div>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot dot-completed"></span>
                <span className="legend-label">Completed</span>
                <span className="legend-value">{stats.done} ({Math.round(donePct)}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-inprogress"></span>
                <span className="legend-label">In Progress</span>
                <span className="legend-value">{stats.inProgress} ({Math.round(progressPct)}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-todo"></span>
                <span className="legend-label">To Do</span>
                <span className="legend-value">{stats.todo} ({Math.round(todoPct)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Velocity / Burndown Curve (Area Spline Graph) */}
        <div className="chart-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Sprint Velocity & Burndown</h3>
              <p className="chart-subtitle">Tasks completed vs planned trajectory (Weekly)</p>
            </div>
            <div className="graph-badges">
              <span className="graph-badge badge-actual">● Actual</span>
              <span className="graph-badge badge-planned">--- Target</span>
            </div>
          </div>

          <div className="area-graph-container">
            <svg viewBox="0 0 420 180" className="velocity-svg">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="30" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="30" y1="155" x2="400" y2="155" stroke="rgba(255,255,255,0.12)" />

              {/* Planned Target Line */}
              <path
                d="M 40 145 L 95 125 L 155 105 L 215 90 L 275 75 L 335 60 L 395 50"
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Area Gradient Fill */}
              <path
                d="M 40 155 L 40 148 Q 95 130 155 110 T 275 60 T 395 28 L 395 155 Z"
                fill="url(#areaGradient)"
              />

              {/* Actual Velocity Spline Line */}
              <path
                d="M 40 148 Q 95 130 155 110 T 275 60 T 395 28"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Data Points */}
              {velocityData.map((d, i) => {
                const x = 40 + i * 59;
                // mapping values
                const yMap = [148, 134, 110, 85, 60, 42, 28];
                const y = yMap[i];
                const isSelected = activeDayIndex === i;

                return (
                  <g key={d.day} onClick={() => setActiveDayIndex(i)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "6" : "4"}
                      fill={isSelected ? "#38bdf8" : "#fff"}
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      className="graph-point"
                    />
                    <text x={x} y="172" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Inter">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Day Tooltip Callout */}
            <div className="graph-callout">
              <span className="callout-day">{velocityData[activeDayIndex].day}:</span>
              <span className="callout-value text-indigo">
                {velocityData[activeDayIndex].completed} tasks completed
              </span>
              <span className="callout-target">
                (target: {velocityData[activeDayIndex].planned})
              </span>
            </div>
          </div>
        </div>

        {/* Chart 3: Priority Distribution Bar Chart */}
        <div className="chart-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Priority Distribution</h3>
              <p className="chart-subtitle">Tasks classified by urgency and impact</p>
            </div>
          </div>

          <div className="priority-bars-container">
            {/* High Priority */}
            <div className="priority-bar-item">
              <div className="bar-label-row">
                <span className="bar-name text-rose">🚩 High Priority</span>
                <span className="bar-count">{stats.high} tasks</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-rose"
                  style={{ width: `${Math.max(8, (stats.high / totalCount) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Medium Priority */}
            <div className="priority-bar-item">
              <div className="bar-label-row">
                <span className="bar-name text-amber">🚩 Medium Priority</span>
                <span className="bar-count">{stats.medium} tasks</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-amber"
                  style={{ width: `${Math.max(8, (stats.medium / totalCount) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Low Priority */}
            <div className="priority-bar-item">
              <div className="bar-label-row">
                <span className="bar-name text-cyan">▼ Low Priority</span>
                <span className="bar-count">{stats.low} tasks</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-cyan"
                  style={{ width: `${Math.max(8, (stats.low / totalCount) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Team Member Workload */}
        <div className="chart-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Team Member Workload</h3>
              <p className="chart-subtitle">Active distribution per engineer</p>
            </div>
          </div>

          <div className="team-workload-list">
            {stats.assignees.slice(0, 5).map(([name, count]) => {
              const pct = Math.min(100, Math.round((count / totalCount) * 100));
              return (
                <div key={name} className="workload-row">
                  <div className="workload-avatar">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="workload-details">
                    <div className="workload-name-row">
                      <span className="workload-name">{name}</span>
                      <span className="workload-task-count">{count} issues</span>
                    </div>
                    <div className="bar-track mini">
                      <div
                        className="bar-fill fill-indigo"
                        style={{ width: `${Math.max(12, pct * 2.5)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
