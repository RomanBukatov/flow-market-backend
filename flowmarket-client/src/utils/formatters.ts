export const translateStatus = (status: string): string => {
  const map: Record<string, string> = {
    'New': 'Новый',
    'Paid': 'Оплачен',
    'Assembling': 'Собирается',
    'PhotoReady': 'Фото готово',
    'Delivering': 'Доставляется',
    'Completed': 'Выполнен',
    'Cancelled': 'Отменен',
    'In Progress': 'В работе',
    'InProgress': 'В работе'
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed': return 'green';
    case 'Cancelled': return 'red';
    case 'New': return 'orange';
    case 'In Progress': return 'blue';
    default: return 'geekblue';
  }
};