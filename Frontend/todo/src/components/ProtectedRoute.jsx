import { useSelector } from "react-redux";
import { Navigate,} from "react-router-dom";

const ProtectedRoute = function ({ children }) { // children = yahn todo route hi hai
  const isAuth = useSelector((state) => state.auth.user); /* select value , state, auth = slice name, os ka status */
  
  if (!isAuth) {  //status false mean, user nhi login so not false true hoa aur if chla
    return <Navigate to="/" />; // wapis login bhaj do
  }
  else{
    return children; // other wise todo hi chla do
  }

};

export default ProtectedRoute;
