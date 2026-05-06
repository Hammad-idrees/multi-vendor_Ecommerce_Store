import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthState {
    user: User | null;
    loading: boolean;
}

type AuthAction =
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
    user: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo')!)
        : null,
    loading: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, user: action.payload, loading: false };
        case 'LOGOUT':
            return { ...state, user: null, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

interface AuthContextType extends AuthState {
    login: (userData: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        if (state.user) {
            localStorage.setItem('userInfo', JSON.stringify(state.user));
        } else {
            localStorage.removeItem('userInfo');
        }
    }, [state.user]);

    const login = (userData: User) => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
