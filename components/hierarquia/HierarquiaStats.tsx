'use client';

type Subsubtopico = {
  id: number;
  nome: string;
};

type Subtopico = {
  id: number;
  nome: string;
  subsubtopicos?: Subsubtopico[];
};

type Topico = {
  id: number;
  nome: string;
  subtopicos?: Subtopico[];
};

type Materia = {
  id: number;
  nome: string;
  topicos?: Topico[];
};

type HierarquiaStatsProps = {
  materias: Materia[];
};

export default function HierarquiaStats({ materias }: HierarquiaStatsProps) {
  const totalMaterias = materias?.length || 0;
  
  const totalTopicos = materias?.reduce(
    (acc, m) => acc + (m.topicos?.length || 0), 
    0
  ) || 0;
  
  const totalSubtopicos = materias?.reduce(
    (acc, m) => acc + (m.topicos?.reduce(
      (acc2, t) => acc2 + (t.subtopicos?.length || 0), 
      0
    ) || 0), 
    0
  ) || 0;
  
  const totalSubsubtopicos = materias?.reduce(
    (acc, m) => acc + (m.topicos?.reduce(
      (acc2, t) => acc2 + (t.subtopicos?.reduce(
        (acc3, s) => acc3 + (s.subsubtopicos?.length || 0), 
        0
      ) || 0), 
      0
    ) || 0), 
    0
  ) || 0;

  const stats = [
    {
      label: 'Matérias',
      value: totalMaterias,
      color: 'blue',
      icon: '📚'
    },
    {
      label: 'Tópicos',
      value: totalTopicos,
      color: 'green',
      icon: '📝'
    },
    {
      label: 'Subtópicos',
      value: totalSubtopicos,
      color: 'purple',
      icon: '📌'
    },
    {
      label: 'Sub-subtópicos',
      value: totalSubsubtopicos,
      color: 'orange',
      icon: '🔸'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      value: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      value: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      value: 'text-purple-900'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      value: 'text-orange-900'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        return (
          <div 
            key={stat.label}
            className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <p className={`text-sm ${colors.text} font-medium`}>{stat.label}</p>
            </div>
            <p className={`text-3xl font-bold ${colors.value}`}>{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
