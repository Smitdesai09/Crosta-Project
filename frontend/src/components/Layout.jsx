import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-gray overflow-hidden">
      
      {/* SIDEBAR */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* NAVBAR */}
        <Navbar 
          onMenuClick={() => setIsMobileOpen(true)} 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};


export default Layout;
// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import Sidebar from './layout/Sidebar';
// import Navbar from './layout/Navbar';

// const Layout = () => {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);

//   return (
//     <div className="flex min-h-screen bg-surface-gray">
//       <Sidebar 
//         isCollapsed={isSidebarCollapsed} 
//         setIsSidebarCollapsed={setIsSidebarCollapsed}
//         isMobileOpen={isMobileOpen}
//         setIsMobileOpen={setIsMobileOpen}
//       />
//       <div className="flex-1 flex flex-col min-w-0">
//         <Navbar 
//           onMenuClick={() => setIsMobileOpen(true)} 
//           isSidebarCollapsed={isSidebarCollapsed}
//           setIsSidebarCollapsed={setIsSidebarCollapsed}
//           isMobileOpen={isMobileOpen}
//           setIsMobileOpen={setIsMobileOpen}
//         />
//         <main className="flex-1 p-4 lg:p-6 overflow-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;