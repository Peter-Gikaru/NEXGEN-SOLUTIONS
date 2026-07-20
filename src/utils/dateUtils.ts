export const calculateExactDateRange = (estimatedDaysStr: string): string => {
  const date = new Date();
  
  if (estimatedDaysStr.toLowerCase().includes('same')) {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } 
  
  if (estimatedDaysStr.toLowerCase().includes('next')) {
    date.setDate(date.getDate() + 1);
    return `Tomorrow, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  
  const match = estimatedDaysStr.match(/(\d+)/g);
  if (match && match.length > 0) {
    const minDays = Math.min(...match.map(Number));
    const maxDays = Math.max(...match.map(Number));
    
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    
    if (minDays === maxDays) {
      return maxDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    return `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  
  
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};
