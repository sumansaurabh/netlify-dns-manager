from setuptools import setup, find_packages

setup(
    name='netlify-dns-manager',
    version='0.1',
    packages=find_packages(),
    description="It provides a command line interface to manage DNS records of a domain hosted on Netlify.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    install_requires=[
        'requests',
        'dnspython',
        'zonefile-parser'

    ],
    url="https://github.com/sumansaurabh/netlify-dns-manager",
    entry_points={
        'console_scripts': [
            'netlify-dns-manage = netlify_dns_manage.main:main',
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)
