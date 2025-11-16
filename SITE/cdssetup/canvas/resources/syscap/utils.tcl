# Command to Auto Create Differential Pairs in the design based on configuration file. 
# Configuration file can be specified in folder $CDS_SITE/cdssetup/canvas/resources/sda.
proc cnsAutoCreateDiffPair { } {
    set retCode 0

    set skillFilePath [cps::getResourceFullPath [file join canvas resources sda acm_code.il]]
    if { [file exists $skillFilePath] != 1 } {
        set skillFilePath 0
    }

    set configFileName [cps::getResourceFullPath [file join canvas resources sda acm_config.txt]]
    if { [file exists $configFileName] != 1 } {
        set configFileName 0
    }

    set reportFileName [file join [cps::getProjectMainDir] "autoDPCreationReport.txt"]

    if { $skillFilePath != 0 && $configFileName != 0 } {
        loadSkillFile $skillFilePath
        set retCode [callSkillFunc "acm_afterCMLaunch" "xx" [list "$reportFileName" "$configFileName"] ]
    }
    return $retCode
}

