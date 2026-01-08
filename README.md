# VAWSafe
To do List after cloning

1. cd VAWSafe
2. py -m venv venv
3. venv/Scripts/Activate
4. pip install -r requirements.txt
5. cd frontend
6. npm install


How to run project
1. cd backend
2. python manage.py seed_region7
4. python manage.py runserver

5. cd frontend
6. npm start


city  csv file
https://psa.gov.ph/system/files/scd/PSGC-1Q-2025-Publication-Datafile.xlsx



(set up sa encyrption keys)
1. create .env file inside backend folder
2. paste this in the .env file
- FERNET_KEYS=9UwJx2SMS03LUK6wC71Wjc7kw7nFoqZjsfzLxZGPMG8=
3. pip install -r requirements.txt
4. do makemigrations and migrate first if you still havent done that
5. python manage.py runserver


