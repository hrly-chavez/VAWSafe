# VAWSafe

(SET UP RANI WAPANI MGA MODEL OR WHATNOT)

#NOTE: if naa moy I install na package I sud lang sa venv(cd VAWSafe) nya ayaw kalimot I sud sa requirments.txt  

To do List after cloning

1. cd VAWSafe
2. py -m venv venv
3. venv/Scripts/Activate
4. pip install -r requirements.txt
5. cd frontend
6. npm install


How to run project
1. cd backend
2. python manage.py runserver

3. cd frontend
4. npm start



Kung libog ang frontend

src/
├── api/                 # Axios instance
├── components/          # Shared components
├── pages/               # auth & role pages
│   ├── auth/
│   ├── desk_officer/<file_name>.js
│   ├── social_worker/<file_name>.js
│   ├── victim/<file_name>.js
│   ├── dswd/<file_name>.js
├── App.js               # Main router setup
├── index.js             # Entry point
├── index.css            # Base global styles


unsaon pag search
http://localhost:3000/desk_officer
http://localhost:3000/social_worker
http://localhost:3000/dswd
