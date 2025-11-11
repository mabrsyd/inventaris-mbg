import React, { useState } from 'react';

interface TabProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const Tab: React.FC<TabProps> = ({ label, onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 focus:outline-none ${isActive ? 'border-b-2 border-blue-500' : 'text-gray-500'}`}
    >
      {label}
    </button>
  );
};

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            onClick={() => setActiveTab(index)}
            isActive={activeTab === index}
          />
        ))}
      </div>
      <div className="p-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;