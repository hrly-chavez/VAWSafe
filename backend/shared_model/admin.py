from django.contrib import admin
from .models import *


admin.site.register(Official)
admin.site.register(OfficialFaceSample)

admin.site.register(Victim)
admin.site.register(VictimFaceSample)
admin.site.register(IncidentInformation)

admin.site.register(Session)
admin.site.register(SessionType)
admin.site.register(Question)
admin.site.register(Informant)
admin.site.register(Address)
admin.site.register(Perpetrator)
admin.site.register(Evidence)

# admin.site.register(Province)
# admin.site.register(Municipality)
# admin.site.register(Barangay)
# admin.site.register(Sitio)
# admin.site.register(Street)