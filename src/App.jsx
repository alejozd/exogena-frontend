import { AuthProvider } from "./context/AuthProvider"; // Ajusta la ruta si es necesario
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
