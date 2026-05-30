import { useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSideBar from '../../components/admin/AdminSideBar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'

const Layout = () => {

  const { isAdmin, fetchIsAdmin } = useAppContext();

  useEffect(() => {
    fetchIsAdmin();
  }, [fetchIsAdmin])

  return isAdmin ? (
    <div>
      <AdminNavbar />
      <div className='flex'>
        <AdminSideBar />
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100ch-64px)] overflow-y-auto'>
            <Outlet />
        </div>
      </div>
    </div>
  ) : <Loading/>
}

export default Layout
