import { useEffect, useState } from 'react';

export const NewsInfo = () => {
interface Rates {
  EUR?: string;
  USD?: string;
}

  const [rates, setRates] = useState<Rates | null>(null);

  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => setRates(data))
      .catch(err => console.error(err));
  }, []);

  if (!rates) return <div className='flex flex-col justify-center items-center w-full'><p>Loading...</p></div>;

  return (
    <section className="flex flex-col justify-center items-center w-full gap-3" >
      <div className='bg-gray-200 p-10 rounded-2xl border border-gray-300'>
      <h2>Demo exchange rates · USD</h2>
      <ul>
        <li>1 EUR = {rates.EUR} USD</li>
        <li>1 USD = {rates.USD} USD</li>
      </ul>
      </div>
    </section>
  );
}

export default NewsInfo;
