export const getCurrentDatetime = () => {
  const options = { month: 'numeric', year: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' } as const;
  const event = new Date();

  const currentDatetime = event.toLocaleDateString(undefined, options);

  return currentDatetime;
};

/**
 * @param _date 2021-11-26T08:27:00.963Z
 * @returns 11.26.2021 at 8.27 am
 */
export const formatDatetime = (_date: string) => {
  if (!_date.includes('/') && !_date.includes('T')) return _date;

  let annee, month, day, hoursStr, minutes, ampm;

  if (_date.includes('/')) {
    const [date, time] = _date.split(', ');
    [month, day, annee] = date.split('/');
    [hoursStr, ampm] = time.split(' ');
    [hoursStr, minutes] = hoursStr.split(':');
    ampm = ampm.toLowerCase();

    month = month.length === 1 ? '0' + month : month;
    day = day.length === 1 ? '0' + day : day;
  } else if (_date.includes('T')) {
    const [date, time] = _date.split('T');
    [annee, month, day] = date.split('-');
    [hoursStr, minutes] = time.split(':');
    let hours = parseInt(hoursStr);
    ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    hoursStr = hours < 10 ? '0' + hours : hours.toString();
  }

  return month + '.' + day + '.' + annee + ' at ' + hoursStr + '.' + minutes + ' ' + ampm;
};

export const truncateAddress = (address: string) => address.slice(0, 4) + '...' + address.slice(address.length - 4);

export const scrollToID = (id: string) => {
  const anchor = document.querySelector(`#${id}`);
  if (!anchor) return;
  anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export async function fetchWithTimeout(resource: RequestInfo, options: any = {}) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}


export const pluralise = (word: string, amount: number) => {
  if (amount === 1) {
    return word;
  } else {
    return word + 's';
  }
};