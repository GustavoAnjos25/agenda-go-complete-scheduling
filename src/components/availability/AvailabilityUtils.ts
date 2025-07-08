export const daysOfWeek = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' }
];

export const initializeAvailability = (data: any[], professionalId: string) => {
  return daysOfWeek.map(day => {
    const existing = data?.find(item => item.day_of_week === day.id);
    return existing || {
      day_of_week: day.id,
      professional_id: professionalId,
      is_available: false,
      start_time: '09:00',
      end_time: '18:00'
    };
  });
};