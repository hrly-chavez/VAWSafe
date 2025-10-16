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


city  csv file
https://psa.gov.ph/system/files/scd/PSGC-1Q-2025-Publication-Datafile.xlsx

(set_up sa address)
1.cd backend
2.run in the terminal
  -python manage.py seed_region7


(set up sa encyrption keys)
1. create .env file inside backend folder
2. ipaste ni nga sa .env
- FERNET_KEYS=9UwJx2SMS03LUK6wC71Wjc7kw7nFoqZjsfzLxZGPMG8=
3. pip install -r requirements.txt
4. if wala pa naka makemigrate and migrate buhata sa na
5. if naay existing data sa official sa imong db i delete sa na kay mag conflict na sa updated nga datatype sa of_email ditso dayon sa 3.
6. runserver na


