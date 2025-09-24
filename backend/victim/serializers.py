from rest_framework import serializers
from django.contrib.auth.models import User
from shared_model.models import *

class VictimSignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    birth_date = serializers.DateField(write_only=True)

    class Meta:
        model = Victim
        fields = ['email', 'password', 'full_name', 'birth_date']

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        full_name = validated_data['full_name']
        birth_date = validated_data['birth_date']

        names = full_name.split()
        fname = names[0]
        lname = names[-1] if len(names) > 1 else ''

        user = User.objects.create_user(username=email, email=email, password=password,
                                        first_name=fname, last_name=lname)

       
        victim = Victim.objects.create(
            vic_account=user,
            vic_fname=fname,
            vic_lname=lname,
            vic_email=email,
            vic_birth_date=birth_date
        )
        return victim

class VictimProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='vic_account.username')
    email = serializers.EmailField(source='vic_account.email')
    
    class Meta:
        model = Victim
        reaad_only_fields = "__all__"
