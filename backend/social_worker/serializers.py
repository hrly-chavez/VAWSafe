from rest_framework import serializers
from shared_model.models import *

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['username', 'password']

    def create(self, validated_data):
        # You should hash the password here in a real-world app
        return Account.objects.create(**validated_data)

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
            'of_photo',
            'of_embedding',
        ]
        read_only_fields = ['of_embedding']

    def create(self, validated_data):
        # Generate username from fname+lname
        username = f"{validated_data['of_fname'].lower()}{validated_data['of_lname'].lower()}"
        password = Account.objects.make_random_password()

        # Create related account
        account = Account.objects.create(username=username, password=password)

        # Create the Official object
        official = Official.objects.create(account=account, **validated_data)
        return official
    
    
# class OfficialSerializer(serializers.ModelSerializer):
#     account = AccountSerializer(required=False, allow_null=True)

#     class Meta:
#         model = Official
#         fields = [
#             'id',
#             'account',
#             'name',
#             'sex',
#             'dob',
#             'pob',
#             'address',
#             'contact',
#             'role',
#             'brgy_assigned',
#             'specialization',
#             'photo',
#             'embedding',
#         ]
#         read_only_fields = ['embedding']

#     def create(self, validated_data):
#         account_data = validated_data.pop('account', None)

#         account = None
#         if account_data:
#             account = Account.objects.create(**account_data)

#         official = Official.objects.create(account=account, **validated_data)
#         return official