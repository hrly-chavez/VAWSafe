# VAWSafe

Database Setup

1. Open pgAdmin
2. Right click on "Databases" > Create > Database
3. Name it "vawsafe"
4. Right click on "vawsafe" > Restore...
5. select "vawsafe.sql"
6. Inside the folder "VAWSafe > backend > vawsafe_core > settings.py"
7. Locate DATABASES = {...} , inside change username and password to your pgadmin username and password. If you named the database different e.g. "test", then change "NAME = vawsafe" to "NAME = test"

Encryption Keys Setup

1. Create a .env file inside "VAWSafe > backend" folder
2. Paste this in the .env file "FERNET_KEYS=9UwJx2SMS03LUK6wC71Wjc7kw7nFoqZjsfzLxZGPMG8="

After cloning the repository (Initial Configuration)

1. open terminal or command prompt
2. change current directory to where the folder is located, "cd VAWSafe"
3. type "py -3.10 -m venv venv"
4. type "venv/Scripts/Activate"
5. type "pip install -r requirements.txt", dlib gets installed here
6. also type "pip install -r updated_requirements.txt", this is necessary to install updated packages
7. create admin account by typing "py manage.py createsuperuser" and then input the necessary credentials such as username, password, email, etc.
8. type "py manage.py makemigrations"
9. type "py manage.py migrate"
10. open a second terminal or command prompt
11. type "cd frontend"
12. type "npm install"

How to run project

1. Open terminal or command prompt
2. type "cd backend"
3. type "python manage.py seed_region7"
4. type "python manage.py runserver"
5. open a second terminal or command prompt
6. type "cd frontend"
7. type "npm start"

city csv file
https://psa.gov.ph/system/files/scd/PSGC-1Q-2025-Publication-Datafile.xlsx
