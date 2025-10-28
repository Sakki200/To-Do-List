## FAIRE MARCHER TO-DO LIST

### 📌 Prérequis
- Python 3.13+
- Node.js 22+

### LA PARTIE BACKEND (Django)

**Récupérer le répertoire GitHub**  
```bash
git clone https://github.com/Sakki200/To-Do-List.git
```

**Se positionner sur le dossier backend :**  
```bash
cd backend
```




**Si cela est souhaité, créer son environnement virtuel et l'activer avec le terminal. :**  
```bash
# Windows PowerShell
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

**Installer toutes les dépendances :**  
```bash
pip install -r requirements.txt
```

**Créer la base de données et exécuter les migrations :**  
```bash
python manage.py makemigrations
python manage.py migrate
```

**Lancer le serveur Python :**  
```bash
python manage.py runserver
```

Actuellement les mails sont reçus directement dans la console

### LA PARTIE FRONTEND (React)

**Créer un nouveau terminal et se positionner sur le dossier frontend :**  
```bash
cd frontend
```

**Installer toutes les dépendances :**  
```bash
pnpm install
```

**Lancer le serveur React :**  
```bash
pnpm run dev
```
