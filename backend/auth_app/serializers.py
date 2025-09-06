from rest_framework import serializers
from shared_model.models import *
from django.contrib.auth.models import User

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['username', 'password']

class OfficialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Official
        fields = [
            'of_id',
            'of_fname',
            'of_lname',
            'of_m_initial',
            'of_suffix',
            'of_sex',
            'of_dob',
            'of_pob',
            'of_address',
            'of_contact',
            'of_role',
            'of_brgy_assigned',
            'of_specialization',
        ]
