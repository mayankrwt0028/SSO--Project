import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User{
  id:number;
  name: string;
  email: string;
  provider:string;
  role:string;
  createdAt?: string
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user:User | null)=>void
  logout: ()=> Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
}:{
  children: ReactNode
}){
  const [user, setUser ] = useState<User |null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const checkAuth = async ()=>{
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials:"include"
        })
        if(!response.ok){
          setUser(null)
          return
        }

        const data = await response.json()

        setUser(data.user)
      } catch (error) {
        console.error(error);
        setUser(null);
      }finally{
        setLoading(false)
      }
    }
   
    checkAuth()
  
  },[])
   const logout = async ()=>{
      try {
        await fetch("http://localhost:3000/auth/logout",{
          method:"POST",
          credentials:"include"
        })
        setUser(null)
      } catch (error) {
        console.error(error)
      }
    }
  return (
    <AuthContext.Provider
    value={{
      user,
      loading,
      setUser,
      logout,
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  const context = useContext(AuthContext);
  if(!context){
    throw new Error("useAuth must be used inside  AuthProvider")
  }
  return context
}