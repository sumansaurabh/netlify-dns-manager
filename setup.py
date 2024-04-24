from setuptools import setup, find_packages

setup(
    name='netlify-dns-manager',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        'requests',
        'dnspython'
    ],
    entry_points={
        'console_scripts': [
            'netlify-dns-manage = netlify_dns_manage.main:main',
        ],
    },
)
