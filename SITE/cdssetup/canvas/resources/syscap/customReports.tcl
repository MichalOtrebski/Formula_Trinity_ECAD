# ----------------------------------------------------------------------------
# Filename: customReports.tcl
# This file should be placed in one of the following locations:
# 1. For site-wide availability place it at -
#      $CDS_SITE/cdssetup/canvas/resources/sda/
# 2. For user-only availability place it at -
#      $HOME/cdssetup/canvas/resources/sda/
# ----------------------------------------------------------------------------
# Description: Custom Reports Tcl Script
# ----------------------------------------------------------------------------
package require sch 1.0
namespace eval customReports {
    set nThisDir [file dirname [info script]]
    set nInited {}
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : initAPIs                                                 #
# Description    : This procedure loads all required libraries for          #
#                  querying design connectivity information                 #
#############################################################################
proc customReports::initAPIs {} {
    if { $::customReports::nInited == {} } {
        catch { uplevel 1 {load $::env(ADE_CONNSERVER_LIB) \
            TddConnectivityServer }}
        catch { uplevel 1 {load $::env(ADE_PKGSERVER_LIB)  \
            TddPackagingServer }}
        catch { uplevel 1 {load $::env(ADE_DRC_LIB) \
            drc }}
        set ::customReports::nInited 1
    }
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : showReport                                               #
# Description    : This procedure display the generated report              #
#                  in a text viewer                                         #
#                  with the report and designName as parameters             #
#############################################################################
proc customReports::showReport { report designName destPath } {
    if {$destPath == [pwd]} {
        set fileName [concat $report $designName.txt]
        set filePath [concat $destPath/$fileName]
        exec {*}[auto_execok start] {} $filePath
    } else {
        exec {*}[auto_execok start] {} $destPath
    }
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : generateReport                                           #
# Description    : This procedure is used to generate the report with       #
#                  a specific name and at a specific destination. It takes  #
#                  multiple number of arguments. Arguments are              #
#                  noOfTimesFunctionCalled nameOfFile destPath              #
#                  [list of column name] [list of values to dump]#          #
#############################################################################
proc customReports::generateReport { args } {
    set destFilePath [lindex $args 1]
    if {[lindex $args 0] == 1} {
        set op [open "$destFilePath" "w+"]
        set columnNames [lindex $args 2]
        set noOfItems [llength $columnNames]
        set columnNamesToDump {}
        foreach item $columnNames {
            if {[lsearch $columnNames $item]== [expr $noOfItems - 1]} {
                set columnNamesToDump [concat $columnNamesToDump $item ]
            } else {
                set columnNamesToDump [concat $columnNamesToDump $item,]
            }
        }
        puts  $op $columnNamesToDump
    } else {
        set op [open "$destFilePath" "a+"]
    }
    set itemToCheck [lindex $args 3]
    set  dataToDump {}
    set noOfItems [llength $itemToCheck]
    foreach item $itemToCheck {
        if {[lsearch $itemToCheck $item]== [expr $noOfItems - 1]} {
            set dataToDump [concat $dataToDump $item ]
        } else {
            set dataToDump [concat $dataToDump $item,]
        }
    }
    puts  $op $dataToDump
    close $op
    return 1
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : singleNodeNetData                                        #
# Description    : This procedure is used to get the single node nets in    #
#                  the design. This function iterates over all the nets in  #
#                  the design using netIter which is generated using        #
#                  createIPhysNetIter. Using pointer to each net connIter   #
#                  is generated which is used to get the pins connected to  #
#                  net. If number of pins connected to net comes out to be  #
#                  zero then that net is sent to the report. This function  #
#                  internally calls generateReport with required arguments  #
#                  to generate the report. Arguments are                    #
#                  destPath nameOfFile                                      #
#############################################################################
proc customReports::singleNodeNetData {destPath} {
    initAPIs
    set  ret 0
    set  c [getServer]
    set  designName [sch::dbGetRootDesignName]
    set  dContextHandle [ $c findDesign $designName]
    set  reportCallCount 0
    set  netIter [ createIPhysNetIter $dContextHandle 1]
    while { [ $netIter more ]} {
        set count 0
        set net [$netIter get]
        if {$net!="NULL"} {
            set connIter [$net beginPin]
            while { [ $connIter more ] } {
                set pin [$connIter get]
                if {$pin!="NULL"} {
                    set pinName [$pin name]
                    set physInst [$pin physPartInst]
                    if {$physInst!="NULL"} {
                        set physInstName [$physInst name]
                        set instAndPinName [concat $physInstName.$pinName]
                    }
                }
                incr count
                set connIter [$connIter increment]
            }
        }
        if { $count == 1} {
            set objectSpath [ $net spath ]
            set objectSpathSplit [split $objectSpath :]
            set reqSpath [lindex $objectSpathSplit 0]
            set blockInstanceName [sch::dbGetBlockInstanceName $reqSpath]
            set pageName [sch::dbGetPagesOfNet $objectSpath]
            set netName [$net name]
            set block [ $dContextHandle cellInterface ]
            set blockName [$block name]
            incr reportCallCount
            if {$destPath==[pwd]} {
                set designName [sch::dbGetRootDesignName ]
                set fileName [concat Single_Node_Nets_ $designName.txt]
                set filePath [concat $destPath/$fileName]
                set ret [generateReport $reportCallCount $filePath \
                    [list "Net Name" "Block Instance Name" "Part Name" "Page Number"] \
                    [list $netName $blockInstanceName $instAndPinName $pageName]]
            } else {
                set ret [generateReport $reportCallCount $destPath \
                    [list "Net Name" "Block Instance Name" "Part Name" "Page Number"] \
                    [list $netName $blockInstanceName $instAndPinName $pageName]]
            }
        }
        set netIter [$netIter increment]
    }
    if { $ret !=0 } {
        showReport Single_Node_Nets_ $designName $destPath
    } else {
        puts "No single node net in the design."
    }
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : unnamedNet                                               #
# Description    : This procedure is used to get the unnamed nets in the    #
#                  design. This function iterates over all the nets in the  #
#                  design using netIter which is generated using            #
#                  dContextHandle. Using pointer to each net name of the    #
#                  net is generated. If net name starts with _ then that    #
#                  name is unnamed net. This function internally calls      #
#                  generateReport with required arguments to generate the   #
#                  report. Arguments are destPath nameOfFile                #
#############################################################################
proc customReports::unnamedNet {destPath  {fileName {}}} {
    initAPIs
    set c [getServer]
    set designName [sch::dbGetRootDesignName]
    set dContextHandle [ $c findDesign $designName]
    set reportCallCount 0
    set netIter [ $dContextHandle beginNet ]
    while { [ $netIter more ]} {
        set count 0
        set net [$netIter get]
        if {$net!= "NULL"} {
            set objectSpath [ $net spath ]
            set pageName [sch::dbGetPagesOfNet $objectSpath]
            set netName [$net name]
            if {[lindex [split $netName _ ] 0] == {}} {
                set block [ $dContextHandle cellInterface ]
                set blockName [$block name]
                incr reportCallCount
                if {$destPath==[pwd]} {
                    set designName [sch::dbGetRootDesignName ]
                    set fileName [concat unnamed_net_ $designName.txt]
                    set filePath [concat $destPath/$fileName]
                    set ret [generateReport $reportCallCount $filePath \
                        [list "Net Name" "Block Name" "Page Number"] \
                        [list $netName $blockName $pageName]]
                } else {
                    set ret [generateReport $reportCallCount $destPath \
                        [list "Net Name" "Block Name" "Page Number"] \
                        [list $netName $blockName $pageName]]
                }
            }
        }
        set netIter [$netIter increment]
    }
    if { $ret !=0 } {
        showReport Unnamed_Net_ $designName $destPath
    } else {
        puts "No unnamed net in the design."
    }
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : compNetList                                              #
# Description    : This procedure is used to get the data of all component  #
#                  pins and the connected nets in the design. Using         #
#                  physPartDefnIter we get physPartDefn. Using physPartDefn #
#                  we get physPartInstIter. Using physPartInstIter we get   #
#                  physPartInst. Using physPartInst we get physFuncIter.    #
#                  Using physFuncIter we get funcInst. Using funcInst we    #
#                  get physPinIter. Using physPinIter we get the pin and    #
#                  connected net. This data is sent to generate the report. #
#                  This function internally calls generateReport with       #
#                  required arguments to generate the report. Arguments are #
#                  destPath nameOfFile                                      #
#############################################################################
proc customReports::compNetList {destPath  {fileName {}}} {
    initAPIs
    set  reportCallCount 0
    set c [getServer]
    set designName [sch::dbGetRootDesignName]
    set dContextHandle [ $c findDesign $designName]
    set physPartDefnIter [ createPhysPartDefnIter $dContextHandle 1]
    while { [ $physPartDefnIter  more ] } {
        set  physPartDefn [ $physPartDefnIter  get ]
        if {$physPartDefn!="NULL"} {
            set  physPartInstIter [ $physPartDefn  beginPartInst]
            while {[ $physPartInstIter  more ]} {
                set  physPartInst [ $physPartInstIter get ]
                if {$physPartInst!="NULL"} {
                    set  physPartName [$physPartInst name]
                    set  physFuncIter [ $physPartInst beginFunc ]
                    while { [ $physFuncIter more ] } {
                        set  funcInst [ $physFuncIter get]
                        set  physPinIter [ $funcInst beginPin]
                        while { [ $physPinIter more ] } {
                            set  physPin [ $physPinIter  get]
                            if {$physPin != "NULL"} {
                                set  physNet [ $physPin  physNet]
                                if {$physNet != "NULL"} {
                                    set  logicalNet [ $physNet getLogicalNet]
                                    set  physicalNetName \
                                        [ $logicalNet physicalNetName ]
                                    set  physPinName [$physPin name]
                                    set  partName \
                                        [concat $physPartName.$physPinName]
                                    incr reportCallCount
                                    if {$destPath==[pwd]} {
                                        set designName [sch::dbGetRootDesignName ]
                                        set fileName [concat  Component_net_list $designName.txt]
                                        set filePath [concat $destPath/$fileName]
                                        set ret [generateReport $reportCallCount \
                                            $filePath [list "RefDes.PinNum" "Net Name"] \
                                            [list $partName $physicalNetName]]
                                    } else {
                                        set ret [generateReport $reportCallCount \
                                            $destPath [list "RefDes.PinNum" "Net Name"] \
                                            [list $partName $physicalNetName]]
                                    }
                                }
                            }
                            set physPinIter [ $physPinIter increment ]
                        }
                        set physFuncIter [ $physFuncIter increment ]
                    }
                }
                set physPartInstIter [ $physPartInstIter increment ]
            }
        }
        set physPartDefnIter   [$physPartDefnIter  increment]
    }
    if { $ret !=0 } {
        showReport Component_net_list $designName $destPath
    } else {
        puts "No component in the design has nets connected to it."
    }
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : netToComp                                                #
# Description    : This procedure is used to get the data of nets and       #
#                  connected pins in the design.Function iterates over all  #
#                  the nets in the design using netIter which is generated  #
#                  using createIPhysNetIter. Using pointer to each net      #
#                  connIter is generated which is used to get the pins      #
#                  connected to net. Data of connected pin and component    #
#                  is sent to generate the report. This function            #
#                  internally calls generateReport with required arguments  #
#                  to generate the report. Arguments are                    #
#                  destPath nameOfFile                                      #
#############################################################################
proc customReports::netToComp {destPath  {fileName {}}} {
    initAPIs
    set c [getServer]
    set designName [sch::dbGetRootDesignName]
    set dContextHandle [ $c findDesign $designName]
    set  reportCallCount 0
    set netIter [ createIPhysNetIter $dContextHandle 1]
    while { [ $netIter more ]} {
        set  instAndPinNameList {}
        set net [$netIter get]
        if {$net!="NULL"} {
            set connIter [$net beginPin]
            while { [ $connIter more ] } {
                set pin [$connIter get]
                if {$pin!="NULL"} {
                    set pinName [$pin name]
                    set physInst [$pin physPartInst]
                    if {$physInst!="NULL"} {
                        set physInstName [$physInst name]
                        set instAndPinName [concat $physInstName.$pinName]
                        lappend  instAndPinNameList $instAndPinName
                    }
                }
                set connIter [$connIter increment]
            }
            set  PartName {}
            foreach item $instAndPinNameList {
                set objectSpath [ $net spath ]
                set pageName [sch::dbGetPagesOfNet $objectSpath]
                set netName [$net name]
                incr reportCallCount
                if {$destPath==[pwd]} {
                    set designName [sch::dbGetRootDesignName ]
                    set fileName [concat NetName_PartName_ $designName.txt]
                    set filePath [concat $destPath/$fileName]
                    set ret [generateReport $reportCallCount $filePath \
                        [list "Net Name" "RefDes.PinNum"] [list $netName $item]]
                } else {
                    set ret [generateReport $reportCallCount $destPath \
                        [list "Net Name" "RefDes.PinNum"] [list $netName $item]]
                }
            }
        }
        set netIter [$netIter increment]
    }
    if { $ret !=0 } {
        showReport NetName_PartName_ $designName $destPath
    } else {
        puts "No net in the design has components connected to it."
    }
}

#############################################################################
# Namespace      : customReports                                            #
# Procedure Name : entry                                                    #
# Description    : Creates menus for the custom reports                     #
#############################################################################
proc customReports::entry {} {
    addMenuToMenuBar customReports {} 1 Help
    addActionToMenu customReports \
        "Unnamed Nets" {::customReports::unnamedNet [pwd]} {} \
        "Show unnamed nets" 0 0
    addActionToMenu customReports \
        "Single-Node Nets" {::customReports::singleNodeNetData [pwd]} {} \
        "Show single node nets" 0 0
    addActionToMenu customReports \
        "Component-Net Connections" {::customReports::compNetList [pwd]} {} \
        "Show component connected to nets" 0 0
    addActionToMenu customReports \
        "Net-Component Connections" {::customReports::netToComp [pwd]} {} \
        "Show nets connected to components" 0 0
}

customReports::entry
# end of file
