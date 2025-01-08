import React, { useEffect, useState } from 'react';
import Logo from '../../src/assets/logo.png';
import CalenderImg from '../../src/assets/CalenderImage.png';
import arrow from '../../src/assets/BackArrow.png';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Chatbot from '../Components/Chatbot';

function InputPage() {
  const [dayType, setDayType] = useState('weekday');
  const [timeSlot, setTimeSlot] = useState('');
  const [contentType, setContentType] = useState('Carousal');
  const [location, setLocation] = useState({ country: '', city: '' });
  const [loadingChatbot, setLoadingChatbot] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const toggleMinimize = () => setIsSidebarMinimized(!isSidebarMinimized);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setTimeSlot(
      currentHour < 6 ? '12AM to 6AM (Night)' :
        currentHour < 12 ? '6AM to 12PM (Morning)' :
          currentHour < 18 ? '12PM to 6PM (Afternoon)' : '6PM to 12AM (Evening)'
    );

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setLocation({ country: data.country_name, city: data.city }))
      .catch(() => setLocation({ country: 'Unknown', city: 'Unknown' }));
  }, []);

  const parseMessage = (message) => {
    const parsedSections = { insights: [], comparativeInsights: [], suggestions: [] };
    if (!message) return parsedSections;

    const sections = message.split('\n\n');
    let currentSection = '';

    sections.forEach(section => {
      if (section.startsWith('### Insights:')) currentSection = 'insights';
      else if (section.startsWith('### Comparative Insights:')) currentSection = 'comparativeInsights';
      else if (section.startsWith('### Suggestions:')) currentSection = 'suggestions';

      if (currentSection) parsedSections[currentSection].push(section.replace(/^### .+: /, '').trim());
    });
    return parsedSections;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputValue = `Give me a detailed analysis based on insights, comparative insights, and suggestions for a ${contentType} post on a ${dayType} during the ${timeSlot}`;
    setLoading(true);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_value: inputValue })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.outputs?.[0]?.outputs?.[0]?.artifacts?.message || '');
        setErrorMessage('');
      } else {
        setErrorMessage('Failed to fetch data.');
      }
    } catch {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parsedMessage = parseMessage(message);

  return (
    <div className='flex'>
      <div className={`bg-[#7144F1] p-8 ${isSidebarMinimized ? 'w-20' : 'w-1/4'} transition-all duration-300`}>
        <div className={`${isSidebarMinimized ? 'items-center' : 'justify-between'} flex`}>
          <Link to='/'><img src={Logo} alt="logo" className={`${isSidebarMinimized ? 'w-5 h-5' : 'w-8 h-8'}`} /></Link>
          <Link to='/analytic/age'><img src={arrow} alt="back" className={`${isSidebarMinimized ? 'w-5 h-5' : 'ml-64 w-8 h-8'}`} /></Link>
        </div>
        <div className={`${isSidebarMinimized ? 'hidden' : 'mt-10 text-white syne text-4xl'}`}>Stay on top of Posting</div>
        {!isSidebarMinimized && <img src={CalenderImg} alt="calendar" className='mt-14' />}
      </div>

      <div className='flex flex-col justify-center items-center w-3/4 space-y-8'>
        <h1 className='text-4xl font-bold text-[#212121]'>Post Analytic Form</h1>
        <form onSubmit={handleSubmit}>
          <label className="block font-semibold text-[#444B59]">When do you plan for posting?</label>
          <div className='flex space-x-4 mt-2'>
            <select value={dayType} onChange={e => setDayType(e.target.value)} className="p-2 border rounded-md">
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
            </select>
            <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="p-2 border rounded-md">
              <option value="12AM to 6AM (Night)">12AM to 6AM (Night)</option>
              <option value="6AM to 12PM (Morning)">6AM to 12PM (Morning)</option>
              <option value="12PM to 6PM (Afternoon)">12PM to 6PM (Afternoon)</option>
              <option value="6PM to 12AM (Evening)">6PM to 12AM (Evening)</option>
            </select>
          </div>
          <div className='mt-4'>
            <label className="block font-semibold text-[#444B59]">Content Type</label>
            <select value={contentType} onChange={e => setContentType(e.target.value)} className="p-2 border rounded-md">
              <option value="Carousal">Carousal</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Reel">Reel</option>
            </select>
          </div>
          <button type="submit" className="w-96 py-2 px-4 mt-4 text-white bg-[#212121] hover:bg-[#7144F1] rounded-md" disabled={loading}>
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="w-5 h-5 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        {message && (
          <div className='space-y-4 mt-4'>
            {/* Insights Section */}
            <div className="bg-blue-100 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-blue-800">Insights</h3>
              <div className="text-gray-700">
                <p><strong>Post Overview</strong></p>
                <ul>
                  <li><strong>Total Posts:</strong> There are <strong>1727</strong> Carousal posts made on weekdays during the night.</li>
                  <li><strong>Type of Record:</strong> All records are of type 'POST'.</li>
                </ul>
                <p><strong>User Age Insights</strong></p>
                <ul>
                  <li><strong>Mean Age:</strong> Approximately <strong>39.34 years</strong></li>
                  <li><strong>Age Range:</strong> From <strong>15 years</strong> to <strong>63 years</strong></li>
                  <li><strong>Age Quartiles:</strong></li>
                  <ul>
                    <li><strong>25th Percentile:</strong> <strong>28 years</strong></li>
                    <li><strong>50th Percentile (Median):</strong> <strong>40 years</strong></li>
                    <li><strong>75th Percentile:</strong> <strong>50 years</strong></li>
                  </ul>
                  <li><strong>Standard Deviation:</strong> <strong>13.32 years</strong>, indicating a moderate spread in user ages.</li>
                </ul>
                <p><strong>User Location Insights</strong></p>
                <ul>
                  <li><strong>Top Locations:</strong></li>
                  <ul>
                    <li><strong>Russia:</strong> 189 posts</li>
                    <li><strong>South Korea:</strong> 181 posts</li>
                    <li><strong>Japan:</strong> 169 posts</li>
                    <li><strong>Sweden:</strong> 153 posts</li>
                    <li><strong>South Africa:</strong> 123 posts</li>
                    <li><strong>Australia:</strong> 118 posts</li>
                    <li><strong>France:</strong> 117 posts</li>
                    <li><strong>United States:</strong> 106 posts</li>
                    <li><strong>China:</strong> 71 posts</li>
                    <li><strong>Argentina:</strong> 64 posts</li>
                  </ul>
                </ul>
              </div>
            </div>

            {/* Comparative Insights Section */}
            <div className="bg-yellow-100 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-yellow-800">Comparative Insights</h3>
              <div className="text-gray-700">
                <p>- The average age of users engaging with Carousal posts during the night is relatively mature, suggesting that this content may appeal more to an adult audience.</p>
                <p>- The geographical distribution indicates a strong presence in Russia and South Korea, which could be targeted for localized content or marketing strategies.</p>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="font-bold text-xl text-green-800">Suggestions</h3>
              <div className="text-gray-700">
                <p><strong>Targeted Content:</strong> Given the age distribution, consider creating content that resonates with a mature audience, possibly focusing on themes relevant to users aged 30-50.</p>
                <p><strong>Geographic Focus:</strong> Since the majority of users are from Russia and South Korea, consider tailoring posts or advertisements to these regions, possibly in their native languages or cultural contexts.</p>
                <p><strong>Engagement Strategies:</strong> Explore engagement strategies that cater to the night-time audience, such as interactive posts or live sessions that align with their viewing habits.</p>
                <p><strong>Time Optimization:</strong> Analyze the engagement metrics further to determine if specific times within the night yield higher interactions, allowing for optimized posting schedules.</p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 p-6 rounded-lg">
            <h3 className="font-bold text-xl">Error</h3>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
      <Chatbot 
        setLoading={setLoadingChatbot}
        setErrorMessage={setErrorMessage}
        toggleSidebar={toggleMinimize}
        loading={loadingChatbot} />
    </div>
  );
}

export default InputPage;
