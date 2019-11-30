def installed_modules(dir):
    try:
        with open(dir + '/modules') as f:
            return f.read().split(' ')
    except IOError:
        return []


def create_environment(dir):
    import sys
    import os.path
    ready_env = os.path.isfile(dir + '/env')

    if not ready_env:
        print('start creating virtual env for first time for dir $dir')

        if sys.version_info[1] == 6:
            import venv
            venv.create(dir)
        if sys.version_info[1] == 7:
            import virtualenv
            virtualenv.create_environment(dir)

        open(dir + '/env', 'a').close()
        print('done creating virtual env for first time for dir $dir')


def init(dir, required):
    installed = installed_modules(dir)
    create_environment(dir)

    if (installed != required):
        print('existing modules = [' + str(installed) + '], required = [' + str(required) + ']')
        exec (open(dir + '/bin/activator.py').read(), {'__file__': dir + '/bin/activator.py'})
        pipargs = ['install'] + required + ['--prefix', dir, '--ignore-installed', '-q', '--no-warn-script-location',
                                            '--no-warn-conflicts']
        try:
            from pip import main as pipmain
            pipmain.main(pipargs)
        except:
            from pip._internal import main as pipmain
            pipmain.main(pipargs)

        modules_file = open(dir + '/modules', 'w+')
        modules_file.write(' '.join(required))
        modules_file.close()
        print('done installing modules ' + str(required))
    else:
        exec (open(dir + '/bin/activator.py').read(), {'__file__': dir + '/bin/activator.py'})
