# Generated by Django 5.2.3 on 2025-07-29 12:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shared_model', '0004_remove_official_name_official_fname_official_lname_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='official',
            name='account',
            field=models.OneToOneField(default=1, on_delete=django.db.models.deletion.CASCADE, to='shared_model.account'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='official',
            name='m_initial',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='official',
            name='role',
            field=models.CharField(choices=[('VAWDesk', 'VAWDesk'), ('Victim', 'Victim'), ('DSWD', 'DSWD'), ('Social Worker', 'Social Woker')], max_length=50),
        ),
        migrations.AlterField(
            model_name='official',
            name='suffix',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
