from rest_framework import serializers
from shared_model.models import *


class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = [
            "handling_org", "office_address", "report_type",
            "informant_name", "informant_relationship", "informant_contact",
            "created_at",
        ]
        read_only_fields = ["created_at"]

class VictimFaceSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VictimFaceSample
        fields = ["photo", "embedding"]
        read_only_fields = ["embedding"]

class VictimSerializer(serializers.ModelSerializer):
    face_samples = VictimFaceSampleSerializer(many=True, read_only=True)
    case_report = CaseReportSerializer(read_only=True)

    class Meta:
        model = Victim
        fields = "__all__"

class PerpetratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perpetrator
        fields = "__all__"

class IncidentInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentInformation
        fields = "__all__"